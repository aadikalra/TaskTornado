import { RecurringFrequency, HomeworkLink, RecurringHomework } from '@/context/ClassContext';
import { db } from '@/lib/supabase/db';
import { supabase } from '@/lib/supabase/client';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';

export interface RecurringHomeworkConfig {
  frequency: RecurringFrequency;
  endDate?: Date;
  maxOccurrences?: number;
  parentRecurringId: string;
}

export interface RecurringInstance {
  id: string;
  title: string;
  dueDate: Date;
  classId: string;
  priority: string;
  links?: any[];
  parentRecurringId: string;
  isRecurringInstance: true;
}

/**
 * Service for managing recurring homework logic
 */
export class RecurringHomeworkService {

  /**
   * Calculate the next due date based on frequency and current date
   */
  static calculateNextDueDate(frequency: RecurringFrequency, currentDate: Date): Date {
    switch (frequency) {
      case 'daily':
        return addDays(currentDate, 1);
      case 'weekly':
        return addWeeks(currentDate, 1);
      case 'biweekly':
        return addWeeks(currentDate, 2);
      case 'monthly':
        return addMonths(currentDate, 1);
      case 'yearly':
        return addYears(currentDate, 1);
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }

  /**
   * Check if recurring series should continue
   */
  static shouldContinueRecurring(
    currentOccurrences: number,
    config: RecurringHomeworkConfig
  ): boolean {
    // Check max occurrences
    if (config.maxOccurrences && currentOccurrences >= config.maxOccurrences) {
      return false;
    }

    // Check end date
    if (config.endDate && new Date() > config.endDate) {
      return false;
    }

    return true;
  }

  /**
   * Get all active recurring homework that need new instances
   */
  static async getActiveRecurringHomework(userId: string) {
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring_instance', false)
      .not('recurring_frequency', 'is', null);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get existing instances for a recurring series
   */
  static async getRecurringInstances(parentRecurringId: string, userId: string) {
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('user_id', userId)
      .eq('parent_recurring_id', parentRecurringId)
      .eq('is_recurring_instance', true)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a new recurring homework series
   */
  static async createRecurringHomework(
    userId: string,
    classId: string,
    title: string,
    description: string,
    dueDate: Date,
    priority: string,
    links: HomeworkLink[],
    recurring: RecurringHomework
  ): Promise<any> {
    // Convert priority to string to match database schema
    const priorityString = String(priority);

    // Format the due date as a string in the format expected by the database
    const formattedDueDate = format(dueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    // Generate a unique ID for the recurring homework series
    const recurringId = `recurring-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const homeworkData: any = {
      title,
      description: description || '', // Use provided description or empty string
      due_date: formattedDueDate,
      priority: priorityString,
      class_id: classId,
      user_id: userId,
      pinned: false, // Default to not pinned
      completed: false, // Default to not completed
      recurring_id: recurringId, // Link to the recurring series
      recurring_frequency: recurring.frequency,
      recurring_end_date: recurring.endDate ? recurring.endDate.toISOString() : null,
      recurring_max_occurrences: recurring.maxOccurrences || null,
    };

    // Only include links if it's a non-empty array
    if (links && links.length > 0) {
      homeworkData.links = links;
    }

    await db.createHomework(homeworkData);

    // Create the initial homework instance
    const initialHomework = await db.createHomework({
      ...homeworkData,
      parent_recurring_id: recurringId,
      is_recurring_instance: true
    });

    return { masterRecord: homeworkData, initialInstance: initialHomework };
  }

  /**
   * Create next recurring instance
   */
  static async createNextInstance(
    masterRecord: any,
    userId: string
  ): Promise<RecurringInstance | null> {
    const config: RecurringHomeworkConfig = {
      frequency: masterRecord.recurring_frequency,
      endDate: masterRecord.recurring_end_date ? new Date(masterRecord.recurring_end_date) : undefined,
      maxOccurrences: masterRecord.recurring_max_occurrences,
      parentRecurringId: masterRecord.recurring_id
    };

    // Get existing instances count
    const existingInstances = await this.getRecurringInstances(masterRecord.recurring_id, userId);
    const currentOccurrences = existingInstances.length;

    // Check if should continue
    if (!this.shouldContinueRecurring(currentOccurrences, config)) {
      return null;
    }

    // Get the latest instance to calculate next due date
    const latestInstance = existingInstances[existingInstances.length - 1];
    const baseDate = latestInstance ? new Date(latestInstance.due_date) : new Date(masterRecord.due_date);

    // Calculate next due date
    const nextDueDate = this.calculateNextDueDate(config.frequency, baseDate);

    // Create new instance
    const newInstance = {
      title: masterRecord.title,
      description: masterRecord.description,
      due_date: format(nextDueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      priority: masterRecord.priority,
      class_id: masterRecord.class_id,
      user_id: userId,
      pinned: false,
      completed: false,
      links: masterRecord.links,
      parent_recurring_id: masterRecord.recurring_id,
      is_recurring_instance: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('homework')
      .insert([newInstance])
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    if (!data.parent_recurring_id) {
      throw new Error('Created recurring instance has no parent ID');
    }

    // Map database result to RecurringInstance interface
    const result: RecurringInstance = {
      id: data.id,
      title: data.title || '',
      dueDate: new Date(data.due_date),
      classId: data.class_id || '',
      priority: data.priority || '',
      links: data.links || [],
      parentRecurringId: data.parent_recurring_id,
      isRecurringInstance: true
    };

    return result;
  }

  /**
   * Process all recurring homework for a user
   * This should be called periodically (e.g., daily)
   */
  static async processRecurringHomework(userId: string): Promise<void> {
    try {
      // Get all active recurring homework
      const activeRecurring = await this.getActiveRecurringHomework(userId);

      for (const masterRecord of activeRecurring) {
        if (!masterRecord.recurring_id) {
          console.warn('Skipping recurring homework with null recurring_id', masterRecord);
          continue;
        }
        // Get existing instances
        const existingInstances = await this.getRecurringInstances(masterRecord.recurring_id, userId);

        // Check if we need to create a new instance
        const shouldCreateNew = this.shouldCreateNewInstance(masterRecord, existingInstances);

        if (shouldCreateNew) {
          await this.createNextInstance(masterRecord, userId);
        }
      }
    } catch (error) {
      console.error('Error processing recurring homework:', error);
      throw error;
    }
  }

  /**
   * Determine if a new instance should be created
   */
  private static shouldCreateNewInstance(
    masterRecord: any,
    existingInstances: any[]
  ): boolean {
    if (existingInstances.length === 0) {
      // No instances yet, should create first one
      return true;
    }

    const config: RecurringHomeworkConfig = {
      frequency: masterRecord.recurring_frequency,
      endDate: masterRecord.recurring_end_date ? new Date(masterRecord.recurring_end_date) : undefined,
      maxOccurrences: masterRecord.recurring_max_occurrences,
      parentRecurringId: masterRecord.recurring_id
    };

    // Check if we've reached max occurrences
    if (config.maxOccurrences && existingInstances.length >= config.maxOccurrences) {
      return false;
    }

    // Check if we've passed the end date
    if (config.endDate && new Date() > config.endDate) {
      return false;
    }

    // Get the latest instance
    const latestInstance = existingInstances[existingInstances.length - 1];
    const latestDueDate = new Date(latestInstance.due_date);

    // Check if it's time to create the next instance
    const nextDueDate = this.calculateNextDueDate(config.frequency, latestDueDate);

    // Create instance if the next due date is today or in the past
    return nextDueDate <= new Date();
  }

  /**
   * Delete entire recurring series
   */
  static async deleteRecurringSeries(recurringId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('user_id', userId)
      .or(`recurring_id.eq.${recurringId},parent_recurring_id.eq.${recurringId}`);

    if (error) throw error;
  }

  /**
   * Update recurring series settings
   */
  static async updateRecurringSeries(
    recurringId: string,
    userId: string,
    updates: Partial<RecurringHomeworkConfig>
  ): Promise<void> {
    const updateData: any = {};

    if (updates.frequency) updateData.recurring_frequency = updates.frequency;
    if (updates.endDate) updateData.recurring_end_date = updates.endDate.toISOString();
    if (updates.maxOccurrences !== undefined) updateData.recurring_max_occurrences = updates.maxOccurrences;

    const { error } = await supabase
      .from('homework')
      .update(updateData)
      .eq('user_id', userId)
      .eq('recurring_id', recurringId)
      .eq('is_recurring_instance', false);

    if (error) throw error;
  }
}

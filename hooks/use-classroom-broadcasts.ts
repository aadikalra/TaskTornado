'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { refreshClassroomData } from '@/lib/classroom';
import type { Class } from '@/context/ClassContext';

export function useClassroomBroadcasts(classes: Class[]) {
  const ids = classes.filter(cls => cls.is_shared).map(cls => cls.id).sort().join(',');
  useEffect(() => {
    if (!ids) return;
    const channels = ids.split(',').map(id => supabase.channel(`classroom:${id}`, { config: { private: true } })
      .on('broadcast', { event: 'changed' }, refreshClassroomData)
      .subscribe(status => { if (status === 'SUBSCRIBED') refreshClassroomData(); }));
    return () => { channels.forEach(channel => { void supabase.removeChannel(channel); }); };
  }, [ids]);
}

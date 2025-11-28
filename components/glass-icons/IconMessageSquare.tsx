import React, { SVGProps } from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: string;
}

function IconMessageSquare({ size = '24px', ...props }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" className="nc-icon-wrapper">
            <path 
              d="M15.9414 10C19.8397 10.0001 22.9999 13.1603 23 17.0586C23 18.1307 22.1307 19 21.0586 19H9.94141C8.86932 19 8 18.1307 8 17.0586C8.00012 13.1603 11.1603 10.0001 15.0586 10H15.9414ZM15.5 1C17.433 1 19 2.567 19 4.5C19 6.433 17.433 8 15.5 8C13.567 8 12 6.433 12 4.5C12 2.567 13.567 1 15.5 1Z" 
              fill="url(#qz5mxs786da-1752500502811-1433248_users_existing_0_y95s6luwt)" 
              data-glass="origin" 
              mask="url(#qz5mxs786da-1752500502811-1433248_users_mask_yf9omh5zt)" 
            />
            <path 
              d="M15.9414 10C19.8397 10.0001 22.9999 13.1603 23 17.0586C23 18.1307 22.1307 19 21.0586 19H9.94141C8.86932 19 8 18.1307 8 17.0586C8.00012 13.1603 11.1603 10.0001 15.0586 10H15.9414ZM15.5 1C17.433 1 19 2.567 19 4.5C19 6.433 17.433 8 15.5 8C13.567 8 12 6.433 12 4.5C12 2.567 13.567 1 15.5 1Z" 
              fill="url(#qz5mxs786da-1752500502811-1433248_users_existing_0_y95s6luwt)" 
              data-glass="clone" 
              filter="url(#qz5mxs786da-1752500502811-1433248_users_filter_3otwug04l)" 
              clipPath="url(#qz5mxs786da-1752500502811-1433248_users_clipPath_bg1gnmpmw)" 
            />
            <path 
              d="M10.3076 12C14.556 12 18 15.444 18 19.6924C18 20.9668 16.9668 22 15.6924 22H4.30762C3.03317 22 2.00004 20.9668 2 19.6924C2 15.444 5.44404 12 9.69238 12H10.3076ZM10 2C12.2091 2 14 3.79086 14 6C14 8.20914 12.2091 10 10 10C7.79086 10 6 8.20914 6 6C6 3.79086 7.79086 2 10 2Z" 
              fill="url(#qz5mxs786da-1752500502811-1433248_users_existing_1_nqwjcp74f)" 
              data-glass="blur" 
            />
            <path 
              d="M13.25 6C13.25 4.20507 11.7949 2.75 10 2.75C8.20507 2.75 6.75 4.20507 6.75 6C6.75 7.79493 8.20507 9.25 10 9.25V10C7.79086 10 6 8.20914 6 6C6 3.79086 7.79086 2 10 2C12.2091 2 14 3.79086 14 6C14 8.20914 12.2091 10 10 10V9.25C11.7949 9.25 13.25 7.79493 13.25 6Z" 
              fill="url(#qz5mxs786da-1752500502811-1433248_users_existing_2_wnwbkzqj7)" 
            />
            <path 
              d="M15.6924 21.25V22H4.30762V21.25H15.6924ZM17.25 19.6924C17.25 15.8583 14.1417 12.75 10.3076 12.75H9.69238C5.85825 12.75 2.75 15.8583 2.75 19.6924C2.75004 20.5526 3.44739 21.25 4.30762 21.25V22C3.11295 22 2.13009 21.0921 2.01172 19.9287L2 19.6924C2 15.5767 5.23229 12.2156 9.29688 12.0098L9.69238 12H10.3076C14.556 12 18 15.444 18 19.6924L17.9883 19.9287C17.8778 21.0145 17.0145 21.8778 15.9287 21.9883L15.6924 22V21.25C16.5526 21.25 17.25 20.5526 17.25 19.6924Z" 
              fill="url(#qz5mxs786da-1752500502811-1433248_users_existing_3_let3hcao2)" 
            />
            <defs>
              <linearGradient 
                id="qz5mxs786da-1752500502811-1433248_users_existing_0_y95s6luwt" 
                x1="15.5" y1="1" x2="15.5" y2="19" 
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="rgba(65, 148, 255, 1)" data-glass-11="on" />
                <stop offset="1" stopColor="rgba(125, 156, 195, 1)" data-glass-12="on" />
              </linearGradient>
              <linearGradient 
                id="qz5mxs786da-1752500502811-1433248_users_existing_1_nqwjcp74f" 
                x1="10" y1="2" x2="10" y2="22" 
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="rgba(227, 227, 229, 0.6)" data-glass-21="on" />
                <stop offset="1" stopColor="rgba(187, 187, 192, 0.6)" data-glass-22="on" />
              </linearGradient>
              <linearGradient 
                id="qz5mxs786da-1752500502811-1433248_users_existing_2_wnwbkzqj7" 
                x1="10" y1="2" x2="10" y2="6.633" 
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="rgba(255, 255, 255, 1)" data-glass-light="on" />
                <stop offset="1" stopColor="rgba(255, 255, 255, 1)" stopOpacity="0" data-glass-light="on" />
              </linearGradient>
              <linearGradient 
                id="qz5mxs786da-1752500502811-1433248_users_existing_3_let3hcao2" 
                x1="10" y1="12" x2="10" y2="17.791" 
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="rgba(255, 255, 255, 1)" data-glass-light="on" />
                <stop offset="1" stopColor="rgba(255, 255, 255, 1)" stopOpacity="0" data-glass-light="on" />
              </linearGradient>
              <filter 
                id="qz5mxs786da-1752500502811-1433248_users_filter_3otwug04l" 
                x="-100%" y="-100%" width="400%" height="400%" 
                filterUnits="objectBoundingBox" 
                primitiveUnits="userSpaceOnUse"
              >
                <feGaussianBlur 
                  stdDeviation="2" 
                  x="0%" 
                  y="0%" 
                  width="100%" 
                  height="100%" 
                  in="SourceGraphic" 
                  edgeMode="none" 
                  result="blur" 
                />
              </filter>
              <clipPath id="qz5mxs786da-1752500502811-1433248_users_clipPath_bg1gnmpmw">
                <path 
                  d="M10.3076 12C14.556 12 18 15.444 18 19.6924C18 20.9668 16.9668 22 15.6924 22H4.30762C3.03317 22 2.00004 20.9668 2 19.6924C2 15.444 5.44404 12 9.69238 12H10.3076ZM10 2C12.2091 2 14 3.79086 14 6C14 8.20914 12.2091 10 10 10C7.79086 10 6 8.20914 6 6C6 3.79086 7.79086 2 10 2Z" 
                  fill="url(#qz5mxs786da-1752500502811-1433248_users_existing_1_nqwjcp74f)" 
                />
              </clipPath>
              <mask id="qz5mxs786da-1752500502811-1433248_users_mask_yf9omh5zt">
                <rect width="100%" height="100%" fill="#FFF" />
                <path 
                  d="M10.3076 12C14.556 12 18 15.444 18 19.6924C18 20.9668 16.9668 22 15.6924 22H4.30762C3.03317 22 2.00004 20.9668 2 19.6924C2 15.444 5.44404 12 9.69238 12H10.3076ZM10 2C12.2091 2 14 3.79086 14 6C14 8.20914 12.2091 10 10 10C7.79086 10 6 8.20914 6 6C6 3.79086 7.79086 2 10 2Z" 
                  fill="#000" 
                />
              </mask>
            </defs>
          </g>
        </svg>);
};

export default IconMessageSquare;
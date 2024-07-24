import React, { FC, ReactNode } from 'react';
import { NavigationBar } from '../navigationbar/NavigationBar';
import './PageWrapper.css';

interface PageWrapperProps {
  children: ReactNode;
}

export const PageWrapper: FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="page-wrapper">
      <NavigationBar />
      <div className="content">
        {React.Children.map(children, (child, index) => (
          <React.Fragment key={index}>{child}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

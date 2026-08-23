import React from "react";
import { Text } from "react-email";

import { emailTypography } from "../config/styles";

interface EmailHeadingProps {
  children: React.ReactNode;
}

export function EmailHeading({ children }: EmailHeadingProps) {
  return (
    <Text className="email-heading font-serif" style={emailTypography.heading}>
      {children}
    </Text>
  );
}

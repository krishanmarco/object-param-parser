import React, { useState } from 'react';
import { applyReadWriteObjectMapper } from "object-param-parser";
import { getLoginFormButtons, loginFormObjectMapper } from "./LoginForm";
import { ExplanationSection, PrintProps } from "./HelperComponents";

export const LoginFormWithReactHooks = () => {
  // Apply the object mapper as a react hook
  const loginForm = applyReadWriteObjectMapper(useState, loginFormObjectMapper);
  return (
    <div>
      <ExplanationSection
        buttons={getLoginFormButtons(loginForm)}/>
      <PrintProps
        id='loginFormWithReactHooks'
        data={loginForm}/>
    </div>
  );
};

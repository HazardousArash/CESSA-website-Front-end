// _components/providers/ReduxProvider.tsx
"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
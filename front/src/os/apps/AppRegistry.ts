import React, { ComponentType } from "react";

export type AppDefinition = {
  id: string;
  name: string;
  icon: string;
  component: ComponentType<any>;
  defaultWidth?: number;
  defaultHeight?: number;
  singleton?: boolean;
  props?: Record<string, any>;
};

class AppRegistry {
  private apps = new Map<string, AppDefinition>();

  register(app: AppDefinition) {
    this.apps.set(app.id, app);
  }

  get(id: string): AppDefinition | undefined {
    return this.apps.get(id);
  }

  getAll(): AppDefinition[] {
    return Array.from(this.apps.values());
  }
}

export const appRegistry = new AppRegistry();

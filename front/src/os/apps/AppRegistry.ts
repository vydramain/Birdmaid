import React, { ComponentType } from "react";
import type { IconType } from "../../ui/icons";

export type AppDefinition = {
  id: string;
  name: string;
  icon: IconType;
  component: ComponentType<any>;
  defaultWidth?: number;
  defaultHeight?: number;
  singleton?: boolean;
  props?: Record<string, any>;
};

export type ContentType = 'image' | 'video' | 'txt' | 'html' | 'webapp';

class AppRegistry {
  private apps = new Map<string, AppDefinition>();
  // Mapping: extension -> appId
  private extensionMap = new Map<string, string>();
  // Mapping: contentType -> appId
  private contentTypeMap = new Map<ContentType, string>();

  register(app: AppDefinition) {
    this.apps.set(app.id, app);
  }

  /**
   * Register content type mapping (e.g., 'image' -> 'imageviewer')
   */
  registerContentType(contentType: ContentType, appId: string) {
    this.contentTypeMap.set(contentType, appId);
  }

  /**
   * Register file extension mapping (e.g., '.png' -> 'imageviewer')
   */
  registerExtension(extension: string, appId: string) {
    this.extensionMap.set(extension.toLowerCase(), appId);
  }

  /**
   * Get app by ID
   */
  get(id: string): AppDefinition | undefined {
    return this.apps.get(id);
  }

  /**
   * Get app for content type
   */
  getByContentType(contentType: ContentType): AppDefinition | undefined {
    const appId = this.contentTypeMap.get(contentType);
    if (!appId) return undefined;
    return this.apps.get(appId);
  }

  /**
   * Get app for file extension
   */
  getByExtension(extension: string): AppDefinition | undefined {
    const appId = this.extensionMap.get(extension.toLowerCase());
    if (!appId) return undefined;
    return this.apps.get(appId);
  }

  /**
   * Resolve app for a file based on extension or metadata
   * Returns appId or undefined
   */
  resolveAppForFile(fileName: string, contentType?: ContentType): string | undefined {
    // First check explicit contentType from metadata
    if (contentType) {
      const appId = this.contentTypeMap.get(contentType);
      if (appId) return appId;
    }

    // Then check file extension
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const appId = this.extensionMap.get(ext.toLowerCase());
    if (appId) return appId;

    return undefined;
  }

  getAll(): AppDefinition[] {
    return Array.from(this.apps.values());
  }
}

export const appRegistry = new AppRegistry();

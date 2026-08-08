"use client";

interface SchemaProviderProps {
  schema: Record<string, any>;
}

export function SchemaProvider({ schema }: SchemaProviderProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

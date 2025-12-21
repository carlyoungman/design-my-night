export type UiType = {
  id: string;
  name: string;
  description?: string;
  priceText?: string;
  valid: boolean;
  message?: string | null;
};

export function normalizeTypeSuggestions(validation: unknown): UiType[] {
  const v = (validation ?? {}) as Record<string, any>;
  const sv = v?.type?.suggestedValues ?? [];
  if (!Array.isArray(sv)) return [];

  return sv
    .map((item: any) => {
      // Accept both: "Sunny Brunch"  OR  { value:{id,name,...}, valid, message }
      const value = item && typeof item === 'object' && 'value' in item ? item.value : item;

      if (typeof value === 'string') {
        return { id: value, name: value, valid: true, message: null } as UiType;
      }
      if (value && typeof value === 'object') {
        return {
          id: String(value.id),
          name: String(value.name ?? value.id),
          valid: Boolean(item?.valid ?? true),
          message: item?.message ?? null,
        } as UiType;
      }
      return null;
    })
    .filter(Boolean) as UiType[];
}

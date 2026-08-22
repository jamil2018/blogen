"use client";

import { Checkbox } from "@heroui/react";
import type { PostReusePermissions } from "../../lib/phase-2/contracts";

type ReusePermissionsFieldsProps = {
  value: PostReusePermissions;
  onChange: (value: PostReusePermissions) => void;
};

export default function ReusePermissionsFields({
  value,
  onChange,
}: ReusePermissionsFieldsProps) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-border p-4">
      <legend className="px-1 text-sm font-medium">Reuse & attribution</legend>
      <p className="text-xs text-muted">
        Control how others may use this post in collections, lineage, and future
        synthesis. Changes apply prospectively.
      </p>
      <Checkbox
        isSelected={value.privateSpaces}
        onChange={(checked) => onChange({ ...value, privateSpaces: checked })}
      >
        Allow in private knowledge spaces and collections
      </Checkbox>
      <Checkbox
        isSelected={value.quotation}
        onChange={(checked) => onChange({ ...value, quotation: checked })}
      >
        Allow quotation with attribution
      </Checkbox>
      <Checkbox
        isSelected={value.publicLineage}
        onChange={(checked) => onChange({ ...value, publicLineage: checked })}
      >
        Allow public lineage on derived work
      </Checkbox>
      <Checkbox
        isSelected={value.synthesis}
        onChange={(checked) => onChange({ ...value, synthesis: checked })}
      >
        Allow use in future AI-assisted synthesis
      </Checkbox>
    </fieldset>
  );
}

"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Label, ListBox, ListBoxItem, Select, Spinner } from "@heroui/react";
import {
  exportMyPostsZip,
  importMyPostsZip,
} from "../../actions/portability";
import { getAllCategories } from "../../data/categoryQueryFunctions";
import { CATEGORY_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import type { Category } from "../../types";
import type { ImportReport } from "../../lib/db/portability";

function downloadBase64Zip(base64: string, filename: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ContentPortabilityView() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: [CATEGORY_DATA],
    queryFn: getAllCategories,
  });

  const onExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const result = await exportMyPostsZip();
      downloadBase64Zip(result.base64, result.filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const onImport = async (file: File | null) => {
    if (!file) return;
    setImporting(true);
    setError(null);
    setReport(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      if (categoryId) formData.set("categoryId", categoryId);
      const result = await importMyPostsZip(formData);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const categoryList = (categories ?? []) as Category[];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Import &amp; export
        </h1>
        <p className="mt-1 text-sm text-muted">
          Export Markdown/HTML plus metadata JSON, or import a zip with mapped /
          skipped / failed reporting. Duplicates resolve by slug or content hash.
        </p>
      </div>

      {error ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <section className="space-y-3 rounded-xl border border-border p-5">
        <h2 className="font-semibold">Export your posts</h2>
        <p className="text-sm text-muted">
          Includes draft, scheduled, published, and archived posts you own.
        </p>
        <Button
          className="rounded-full"
          isDisabled={exporting}
          onPress={() => void onExport()}
        >
          {exporting ? <Spinner size="sm" /> : "Download zip"}
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-5">
        <h2 className="font-semibold">Import posts</h2>
        <p className="text-sm text-muted">
          Zip of <code>.md</code> / <code>.html</code> files. Optional YAML front
          matter: title, slug, summary, tags.
        </p>
        <Select
          selectedKey={categoryId || null}
          onSelectionChange={(key) => setCategoryId(key ? String(key) : "")}
          placeholder="Default category for imports"
        >
          <Label>Category</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {categoryList.map((cat) => (
                <ListBoxItem key={cat.id} id={cat.id} textValue={cat.title}>
                  {cat.title}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <input
          ref={fileRef}
          type="file"
          accept=".zip,application/zip"
          className="sr-only"
          onChange={(e) => void onImport(e.target.files?.[0] ?? null)}
        />
        <Button
          variant="secondary"
          className="rounded-full"
          isDisabled={importing}
          onPress={() => fileRef.current?.click()}
        >
          {importing ? <Spinner size="sm" /> : "Choose zip to import"}
        </Button>

        {report ? (
          <div className="space-y-3 text-sm">
            <p>
              Mapped {report.mapped.length}, skipped {report.skipped.length},
              failed {report.failed.length}.
            </p>
            {report.skipped.length ? (
              <ul className="list-disc pl-5 text-muted">
                {report.skipped.map((item) => (
                  <li key={item.path}>
                    {item.path}: {item.reason}
                  </li>
                ))}
              </ul>
            ) : null}
            {report.failed.length ? (
              <ul className="list-disc pl-5 text-red-600">
                {report.failed.map((item) => (
                  <li key={item.path}>
                    {item.path}: {item.reason}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

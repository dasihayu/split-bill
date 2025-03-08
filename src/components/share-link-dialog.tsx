// src/components/share-link-dialog.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Group } from "@/types";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";
import { compressToEncodedURIComponent } from "@/lib/compression";
import { shortenUrl } from "@/lib/url-shortener";

interface ShareLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

export function ShareLinkDialog({
  open,
  onOpenChange,
  group,
}: ShareLinkDialogProps) {
  const [shareLink, setShareLink] = useState("");
  const [includeExpenses, setIncludeExpenses] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isShortened, setIsShortened] = useState(false);

  const generateShareLink = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Clone the group object
      const groupToShare = { ...group };

      // Remove expenses if not included
      if (!includeExpenses) {
        groupToShare.expenses = [];
      }

      // Create a compressed version of the group data
      const compressedData = await compressToEncodedURIComponent(
        JSON.stringify(groupToShare)
      );

      // Create the share link with the compressed data
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/shared?data=${compressedData}`;

      setShareLink(fullUrl);
      setIsShortened(false);
    } catch (error) {
      toast.error("Gagal membuat link berbagi");
      console.error("Error generating share link:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [group, includeExpenses]);

  useEffect(() => {
    if (open) {
      setIsShortened(false);
      generateShareLink();
    }
  }, [open, includeExpenses, generateShareLink]);

  const shortenShareLink = async () => {
    if (!shareLink || isShortened) return;

    setIsGenerating(true);

    try {
      const shortUrl = await shortenUrl(shareLink);
      setShareLink(shortUrl);
      setIsShortened(true);
      toast.success("Link berhasil dipersingkat");
    } catch (error) {
      toast.error("Gagal mempersingkat link");
      console.error("Error shortening URL:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Link berhasil disalin ke clipboard");
    } catch (error) {
      toast.error("Gagal menyalin link");
      console.error("Error copying to clipboard:", error);
    }
  };

  const shareViaWebShare = async () => {
    if (!navigator.share) {
      toast("Web Share API tidak didukung di browser ini", {
        description: "Silakan salin link secara manual",
      });
      return;
    }

    try {
      await navigator.share({
        title: `Split Bill - ${group.name}`,
        text: `Lihat detail split bill untuk grup ${group.name}`,
        url: shareLink,
      });
      toast.success("Link berhasil dibagikan");
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error("Gagal membagikan link");
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Bagikan Split Bill</DialogTitle>
          <DialogDescription className="text-gray-500">
            Bagikan link ini agar orang lain dapat melihat informasi grup{" "}
            <span className="font-medium">{group.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <Checkbox
              id="include-expenses"
              checked={includeExpenses}
              onCheckedChange={(checked) => setIncludeExpenses(!!checked)}
              className="border-gray-400"
            />
            <label htmlFor="include-expenses" className="text-sm font-medium">
              Sertakan detail pengeluaran
            </label>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="share-link"
              className="text-sm font-medium text-gray-700"
            >
              Link untuk Dibagikan
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="share-link"
                  value={shareLink}
                  readOnly
                  className="pr-10 bg-gray-50 font-mono text-sm"
                  disabled={isGenerating}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-gray-100"
                  onClick={copyLinkToClipboard}
                  disabled={isGenerating}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {!isShortened && !isGenerating && (
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={shortenShareLink}
                >
                  Persingkat
                </Button>
              )}
            </div>
            {isGenerating && (
              <p className="text-sm text-gray-500 flex items-center">
                <span className="animate-spin mr-2">⏳</span>
                {isShortened ? "Mempersingkat link..." : "Membuat link..."}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-1/2"
            onClick={copyLinkToClipboard}
            disabled={isGenerating}
          >
            <Copy className="mr-2 h-4 w-4" />
            Salin Link
          </Button>
          <Button
            type="button"
            className="w-full sm:w-1/2"
            onClick={shareViaWebShare}
            disabled={isGenerating}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Bagikan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

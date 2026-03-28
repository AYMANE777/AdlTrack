"use client";

import React, { useEffect, useState } from "react";
import { RehabilitationRequestForm } from "@/components/RehabilitationRequestForm";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditRehabilitationRequestPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/rehabilitation-requests/${id}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        
        // Convert dates for the form
        const formattedData = {
          ...result,
          request_date: result.request_date ? new Date(result.request_date) : null,
          prosecution_inquiry_date: result.prosecution_inquiry_date ? new Date(result.prosecution_inquiry_date) : null,
          chamber_decision_date: result.chamber_decision_date ? new Date(result.chamber_decision_date) : null,
        };
        
        setData(formattedData);
      } catch (error) {
        toast.error("حدث خطأ أثناء جلب البيانات");
        router.push("/rehabilitation-requests");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <RehabilitationRequestForm initialData={data} />
    </div>
  );
}

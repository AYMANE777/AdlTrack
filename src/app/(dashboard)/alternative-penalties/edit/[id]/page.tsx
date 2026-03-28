"use client";

import React, { useEffect, useState } from "react";
import { AlternativePenaltyForm } from "@/components/AlternativePenaltyForm";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditAlternativePenaltyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/alternative-penalties/${id}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        
        // Convert dates for the form
        const formattedData = {
          ...result,
          judgment_date: result.judgment_date ? new Date(result.judgment_date) : null,
          prosecution_referral_date: result.prosecution_referral_date ? new Date(result.prosecution_referral_date) : null,
          execution_decision_date: result.execution_decision_date ? new Date(result.execution_decision_date) : null,
          report_received_date: result.report_received_date ? new Date(result.report_received_date) : null,
          dispute_date: result.dispute_date ? new Date(result.dispute_date) : null,
          final_decision_date: result.final_decision_date ? new Date(result.final_decision_date) : null,
          appeal_deadline: result.appeal_deadline ? new Date(result.appeal_deadline) : null,
          notification_date: result.notification_date ? new Date(result.notification_date) : null,
        };
        
        setData(formattedData);
      } catch (error) {
        toast.error("حدث خطأ أثناء جلب البيانات");
        router.push("/alternative-penalties");
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
      <AlternativePenaltyForm initialData={data} />
    </div>
  );
}

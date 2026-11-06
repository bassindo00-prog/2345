"use client";

import { useEffect } from "react";

export function MaintenanceAutoRedirect() {
  useEffect(() => {
    let isCancelled = false;

    const checkMaintenance = async () => {
      try {
        const res = await fetch("/api/maintenance", {
          cache: "no-store",
          headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
        });
        const data = await res.json();
        // Jika maintenance sudah dinonaktifkan oleh admin, redirect otomatis ke dashboard
        if (data && data.active === false && !isCancelled) {
          window.location.href = "/dashboard";
        }
      } catch (err) {
        // Abaikan error jaringan sementara
      }
    };

    const interval = setInterval(checkMaintenance, 3000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  return null;
}


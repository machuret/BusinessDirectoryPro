import { useEffect } from "react";
import { useLocation } from "wouter";

export function AdminRedirect() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    navigate("/admin/settings");
  }, [navigate]);
  
  return null;
}
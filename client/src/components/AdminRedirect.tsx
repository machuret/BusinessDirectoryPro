import { useEffect } from "react";
import { useLocation } from "wouter";

export function AdminRedirect() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    navigate("/admin/businesses");
  }, [navigate]);
  
  return null;
}
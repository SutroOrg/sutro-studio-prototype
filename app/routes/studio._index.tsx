import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function StudioIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to the first example app
    navigate("/studio/datastream-pro", { replace: true });
  }, [navigate]);

  return null;
}

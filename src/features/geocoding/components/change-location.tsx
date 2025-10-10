import React, { useState } from "react";
import { useGeolocationStore } from "../../../stores/geolocation-store";
import { getGeoCode } from "@features/geocoding";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";

interface ChangeLocationModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChangeLocationModal = ({ open, onClose }: ChangeLocationModalProps) => {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setManualLocation = useGeolocationStore((s) => s.setManualLocation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate(address);
  };

  const mutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await getGeoCode({
        query,
      });
      if (response.status === "error") {
        throw new Error(response.error.message);
      }
      return response;
    },
    onSuccess: (data) => {
      if (data.data && Array.isArray(data.data.features) && data.data.features.length > 0) {
        const firstFeature = data.data.features[0];
        // Pass coordinates to setManualLocation
        if (firstFeature && firstFeature.geometry && Array.isArray(firstFeature.geometry.coordinates)) {
          setManualLocation({ 
            latitude: firstFeature.geometry.coordinates[1],
            longitude: firstFeature.geometry.coordinates[0],
          },
          firstFeature.properties?.place_formatted || firstFeature.properties?.full_address || address);
        }
        setAddress("");
        setError(null);
        onClose();
      } else {
        setError("No results found for the given address.");
      }
    },
    onError: (error: any) => {
      setError(error.message || "An error occurred while fetching location.");
    },
  });

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Change Location</DialogTitle>
        <DialogContent>
          <Box>
            <form onSubmit={handleSubmit} id="change-location-form">
              <TextField
                autoFocus
                required
                margin="dense"
                id="location-address"
                name="location-address"
                label="Your location"
                type="text"
                fullWidth
                variant="standard"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={mutation.isPending}
              />
            </form>
          </Box>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button disabled={mutation.isPending || !address} type="submit" form="change-location-form">
            {mutation.isPending ? "Searching..." : "Set Location"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
import { useAuth } from "@/context/authcontext";
import { showToast } from "@/components/ui/ToastContainer";
import { useState, useEffect, useCallback } from "react";
import { useWebSocket, EVENT_TYPES } from "./websocketService";
import { BASE_URL } from "@/utils/constants";

export const useGroupService = () => {
    const { authenticatedFetch } = useAuth();

    const createGroup = async (formData) => {
        try {
            const response = await authenticatedFetch("groups", {
                method: "POST",
                body: formData,
            });

            console.log("Response from createGroup:", response);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || errorData.error || "Failed to create group"
                );
            }

            const data = await response.json();

            return data;
        } catch (error) {
            console.error("Error creating group:", error);
            showToast(error.message || "Error creating group", "error");
        }
    }

    const getallgroups = async () => {
        try {
            const response = await authenticatedFetch("groups", {
                method: "GET",
            });
            console.log("Response from getallgroups:", response);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || errorData.error || "Failed to fetch groups"
                );
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching groups:", error);
            showToast(error.message || "Error fetching groups", "error");
        }
    }
    return { createGroup, getallgroups };
}
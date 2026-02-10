"use client";

import { useState, useEffect, useContext } from "react";
import {
  getAllGroups,
  getSubGroups,
  addGroupToTicket,
} from "@/api/ticketingApis";
import MyModal from "@/common/MyModal";
import { alertContext } from "@/hooks/alertContext";

export default function AddGroupToTicketModal({
  isOpen,
  onClose,
  ticket,
  onSuccess,
  existingGroups = [],
}) {
  const [groups, setGroups] = useState([]);
  const [subGroups, setSubGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubGroup, setSelectedSubGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [subGroupLoading, setSubGroupLoading] = useState(false);

  const { setAlertCtx } = useContext(alertContext);

  // Load all groups when modal opens
  useEffect(() => {
    async function loadGroups() {
      try {
        setLoading(true);
        const res = await getAllGroups();
        setGroups(res?.data?.data || res?.data || []);
      } catch (err) {
        console.error("Error loading groups:", err);
        setAlertCtx({
          title: "Error",
          message: "Failed to load groups",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      loadGroups();
      // Reset selections when modal opens
      setSelectedGroup("");
      setSelectedSubGroup("");
      setSubGroups([]);
    }
  }, [isOpen]);

  // Load subgroups when a group is selected
  useEffect(() => {
    async function loadSubGroups() {
      if (!selectedGroup) {
        setSubGroups([]);
        setSelectedSubGroup("");
        return;
      }

      try {
        setSubGroupLoading(true);
        // selectedGroup is now the _id directly
        const res = await getSubGroups(selectedGroup);
        // API returns { _id, group_name, sub_groups: [...] }
        const subGroupsData =
          res?.data?.sub_groups || res?.data?.data?.sub_groups || [];
        setSubGroups(Array.isArray(subGroupsData) ? subGroupsData : []);
        setSelectedSubGroup("");
      } catch (err) {
        console.error("Error loading subgroups:", err);
        setSubGroups([]);
      } finally {
        setSubGroupLoading(false);
      }
    }

    loadSubGroups();
  }, [selectedGroup]);

  const handleSubmit = async () => {
    // Validate subgroup is selected
    if (!selectedSubGroup) {
      setAlertCtx({
        title: "Validation Error",
        message: "Please select a subgroup. Subgroup is required.",
        type: "error",
      });
      return;
    }

    // Check if the selected group has no subgroups available
    if (subGroups.length === 0) {
      setAlertCtx({
        title: "Validation Error",
        message:
          "This group has no subgroups. Please select a group with available subgroups.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ticket_id: ticket.ticket_id,
        group_id: selectedGroup,
        sub_group_id: selectedSubGroup,
      };

      await addGroupToTicket(payload);

      setAlertCtx({
        title: "Success!",
        message: "Group added to ticket successfully",
        type: "success",
      });

      setSelectedGroup("");
      setSelectedSubGroup("");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Add group failed:", err);

      let errorMessage = "Failed to add group. Try again.";
      if (err.response?.status === 409) {
        errorMessage = "This group is already added to the ticket.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setAlertCtx({
        title: "Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter out groups that are already added
  const availableGroups = groups.filter(
    (group) =>
      !existingGroups.some((existing) => existing.group_id === group._id),
  );

  // Check if submit should be disabled
  const isSubmitDisabled =
    !selectedGroup || !selectedSubGroup || subGroupLoading;

  return (
    <MyModal
      toggle={isOpen}
      title="Add Group to Ticket"
      closeMethod={onClose}
      submitMethod={handleSubmit}
      disabled={isSubmitDisabled}
      loader={loading}
      body={
        <div className="space-y-4">
          {/* Group Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Select Group <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm mt-2"
              disabled={loading}
            >
              <option value="">Choose group</option>
              {availableGroups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.group_name}
                </option>
              ))}
            </select>
            {availableGroups.length === 0 && groups.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                All groups have already been added to this ticket.
              </p>
            )}
          </div>

          {/* Subgroup Selection */}
          {selectedGroup && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Select Subgroup <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSubGroup}
                onChange={(e) => setSelectedSubGroup(e.target.value)}
                className={`w-full border rounded-md p-2 text-sm mt-2 ${
                  !subGroupLoading && subGroups.length === 0
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                disabled={subGroupLoading || subGroups.length === 0}
              >
                <option value="">Choose subgroup</option>
                {subGroups.map((subGroup) => (
                  <option key={subGroup._id} value={subGroup._id}>
                    {subGroup.sub_group_en ||
                      subGroup.sub_group_bn ||
                      subGroup.name}
                  </option>
                ))}
              </select>
              {subGroupLoading && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading subgroups...
                </p>
              )}
              {!subGroupLoading && subGroups.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ No subgroups available for this group. Please select
                  another group.
                </p>
              )}
            </div>
          )}
        </div>
      }
    />
  );
}

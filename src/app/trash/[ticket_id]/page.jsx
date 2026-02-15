"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import { ChevronLeft, RotateCcw, XCircle } from "lucide-react";
import {
  getTicketById,
  restoreTicketFromTrash,
  deleteTicketPermanently,
} from "@/api/ticketingApis";
import { alertContext } from "@/hooks/alertContext";

export default function TrashTicketDetails() {
  const { ticket_id } = useParams(); // <-- TRASH ROUTE PARAM
  const router = useRouter();
  const { setAlertCtx } = useContext(alertContext);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  // ------------------ FETCH TICKET ------------------
  useEffect(() => {
    async function fetchTicket() {
      try {
        setLoading(true);
        const res = await getTicketById(ticket_id);
        setTicket(res?.data?.data?.[0] || null);
      } catch (e) {
        setAlertCtx({
          title: "Error",
          message: "Failed to load ticket",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTicket();
  }, [ticket_id]);

  // ------------------ RESTORE HANDLER ------------------
  const handleRestore = async () => {
    try {
      await restoreTicketFromTrash({ ticket_id });

      setAlertCtx({
        title: "Success",
        message: "Ticket restored from trash!",
        type: "success",
      });

      router.push("/trash");
    } catch (err) {
      setAlertCtx({
        title: "Error",
        message: err?.response?.data?.message || "Restore failed",
        type: "error",
      });
    }
  };

  // ------------------ DELETE HANDLER ------------------
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this ticket?"))
      return;

    try {
      await deleteTicketPermanently(ticket_id);

      setAlertCtx({
        title: "Success",
        message: "Ticket permanently deleted!",
        type: "success",
      });

      router.push("/trash");
    } catch (err) {
      setAlertCtx({
        title: "Error",
        message: err?.response?.data?.message || "Delete failed",
        type: "error",
      });
    }
  };

  // ------------------ LOADING / ERROR STATES ------------------
  if (loading)
    return (
      <div className="p-10 text-center text-gray-600">Loading ticket...</div>
    );

  if (!ticket)
    return (
      <div className="p-10 text-center text-gray-600">Ticket not found.</div>
    );

  // ------------------ PAGE UI ------------------
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT SIDE (FULL DETAILS) */}
        <div className="lg:col-span-12 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          {/* HEADER */}
          <div className="border-b p-4 flex items-center gap-3">
            <ChevronLeft
              onClick={() => router.back()}
              className="w-5 h-5 cursor-pointer hover:text-blue-600"
            />
            <span className="text-sm text-gray-700 font-medium flex-1">
              {ticket.title}
            </span>
          </div>

          {/* INFO SECTION */}
          <div className="p-6 border-b text-sm text-gray-700 space-y-1">
            <p>
              <b>Ticket ID:</b> {ticket.ticket_id}
            </p>
            <p>
              <b>Problematic Number:</b> {ticket.problematic_number}
            </p>
            <p>
              <b>Status:</b>{" "}
              <span className="capitalize">{ticket.ticket_status}</span>
            </p>
            <p>
              <b>Issued To:</b> {ticket.issued_to}
            </p>
            <p>
              <b>Issued By:</b> {ticket.issuer_number}
            </p>
          </div>

          {/* ATTACHMENTS */}
          {ticket.attachments?.length > 0 && (
            <div className="p-6 border-b bg-white">
              <h3 className="text-lg font-semibold mb-3">Attachments</h3>

              <div className="flex flex-wrap gap-4">
                {ticket.attachments.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="attachment"
                    onClick={() => setPreviewImage(url)}
                    className="w-40 h-40 object-cover rounded border cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            </div>
          )}

          {/* COMMENTS (READ ONLY) */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-3">Comments</h3>

            {ticket.comments?.length ? (
              ticket.comments.map((c, i) => (
                <div key={i} className="mb-4 border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">
                      {c.commenter_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-gray-700 whitespace-pre-line">
                    {c.message}
                  </p>

                  {c.attachments?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {c.attachments.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="comment-img"
                          onClick={() => setPreviewImage(url)}
                          className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-sm">No comments.</p>
            )}
          </div>
        </div>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg border cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

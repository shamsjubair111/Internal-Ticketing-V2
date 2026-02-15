"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { getTicketById } from "@/api/ticketingApis";

export default function PermanentlyDeletedTicketDetails() {
  const { ticket_id } = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);

  // ---------------- FETCH TICKET ----------------
  useEffect(() => {
    async function fetchTicket() {
      try {
        setLoading(true);
        const res = await getTicketById(ticket_id);
        setTicket(res?.data?.data?.[0] || null);
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError("Failed to load ticket details.");
      } finally {
        setLoading(false);
      }
    }

    if (ticket_id) fetchTicket();
  }, [ticket_id]);

  // ---------------- UI STATES ----------------
  if (loading)
    return (
      <div className="p-10 text-center text-gray-600">
        <h2 className="text-xl font-semibold">Loading ticket...</h2>
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-600">
        <h2 className="text-xl font-semibold">Error</h2>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );

  if (!ticket)
    return (
      <div className="p-10 text-center text-gray-600">
        <h2 className="text-xl font-semibold">Ticket not found</h2>
      </div>
    );

  // ---------------- MAIN UI ----------------
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* FULL WIDTH CONTAINER */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm w-full">
        {/* HEADER */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronLeft
              onClick={() => router.back()}
              className="w-5 h-5 cursor-pointer hover:text-blue-600"
            />
            <span className="text-sm text-gray-700 font-medium">
              {ticket?.title}
            </span>
          </div>

          <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded">
            Permanently Deleted
          </span>
        </div>

        {/* BASIC INFO */}
        <div className="p-6 border-b text-sm text-gray-700 leading-relaxed space-y-1">
          <p>
            <b>Ticket ID:</b> {ticket.ticket_id}
          </p>
          <p>
            <b>Issued To:</b> {ticket.issued_to}
          </p>
          <p>
            <b>Issued By:</b> {ticket.issuer_number}
          </p>
          <p>
            <b>Status:</b>{" "}
            <span className="capitalize">{ticket.ticket_status}</span>
          </p>
        </div>

        {/* ATTACHMENTS */}
        {ticket.attachments?.length > 0 && (
          <div className="p-6 border-b bg-white">
            <h3 className="text-lg font-semibold mb-3">Attachments</h3>

            <div className="flex flex-wrap gap-4">
              {ticket.attachments.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`attachment-${index}`}
                  onClick={() =>
                    setPreviewImage(previewImage === url ? null : url)
                  }
                  className={`w-40 h-40 object-cover rounded border cursor-pointer transition 
                    ${
                      previewImage === url
                        ? "scale-105 ring-4 ring-blue-400"
                        : "hover:opacity-80"
                    }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* COMMENTS */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-3">Comments</h3>

          {ticket.comments?.length > 0 ? (
            ticket.comments.map((comment, i) => (
              <div
                key={comment.id || i}
                className="mb-4 border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between mb-2 items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">
                      {comment.commenter_name || "Unknown"}
                    </span>
                  </div>

                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-gray-700 whitespace-pre-line">
                  {comment.message || ""}
                </p>

                {comment.attachments?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {comment.attachments.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`comment-attachment-${index}`}
                        onClick={() =>
                          setPreviewImage(previewImage === url ? null : url)
                        }
                        className={`w-32 h-32 object-cover rounded border cursor-pointer transition ${
                          previewImage === url
                            ? "scale-105 ring-4 ring-blue-400"
                            : "hover:opacity-80"
                        }`}
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

      {/* IMAGE PREVIEW OVERLAY */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg border border-white cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

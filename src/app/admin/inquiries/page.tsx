'use client'

import React, { useState, useEffect } from 'react';
import Alert from '@/components/Alert';
import { Spinner } from '@/components/LoadingSpinner';
import { FaCheck, FaTrash, FaEnvelope } from 'react-icons/fa';

interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: string;
  status: 'new' | 'seen' | 'responded';
  createdAt: string;
  updatedAt: string;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Fetch inquiries data
  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inquiries');
      
      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }
      
      const data = await response.json();
      // Sort by createdAt (newest first)
      const sortedData = data.sort((a: Inquiry, b: Inquiry) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setInquiries(sortedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('Failed to load inquiries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection of a specific inquiry
  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from being triggered
    
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Check if an inquiry is selected
  const isSelected = (id: string) => selectedIds.has(id);

  // Toggle all inquiries selection
  const toggleSelectAll = () => {
    if (selectedIds.size === inquiries.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all
      setSelectedIds(new Set(inquiries.map(inquiry => inquiry.id)));
    }
  };

  // Delete a single inquiry
  const deleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/inquiries?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete inquiry');
      }
      
      // Update UI
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
      
      // Remove from selected ids
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
      
      // Remove from inquiries list
      setInquiries(prev => prev.filter(inquiry => inquiry.id !== id));
      
      setActionMessage({
        type: 'success',
        message: 'Inquiry successfully deleted'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      setActionMessage({
        type: 'error',
        message: 'Failed to delete inquiry'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete multiple inquiries
  const deleteSelectedInquiries = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected inquiries?`)) return;
    
    try {
      setIsDeleting(true);
      const idArray = Array.from(selectedIds);
      
      // Delete all selected inquiries
      const response = await fetch(`/api/inquiries?ids=${idArray.join(',')}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete inquiries');
      }
      
      // Update UI
      if (selectedInquiry && selectedIds.has(selectedInquiry.id)) {
        setSelectedInquiry(null);
      }
      
      // Update inquiries list
      setInquiries(prev => prev.filter(inquiry => !selectedIds.has(inquiry.id)));
      
      // Clear selection
      setSelectedIds(new Set());
      
      setActionMessage({
        type: 'success',
        message: `${idArray.length} inquiries successfully deleted`
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting inquiries:', err);
      setActionMessage({
        type: 'error',
        message: 'Failed to delete selected inquiries'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Update inquiry status
  const updateInquiryStatus = async (id: string, status: 'new' | 'seen' | 'responded') => {
    try {
      setIsDeleting(true); // Reuse the loading state
      const response = await fetch(`/api/inquiries`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update inquiry status');
      }
      
      // Update UI
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === id ? { ...inquiry, status } : inquiry
      ));
      
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
      
      setActionMessage({
        type: 'success',
        message: 'Inquiry status updated'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Error updating inquiry status:', err);
      setActionMessage({
        type: 'error',
        message: 'Failed to update inquiry status'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'seen':
        return 'bg-blue-100 text-blue-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inquiries</h1>
        
        {selectedIds.size > 0 && (
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 flex items-center"
            onClick={deleteSelectedInquiries}
            disabled={isDeleting}
          >
            <FaTrash className="mr-2" /> 
            Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>
      
      {actionMessage && (
        <Alert 
          type={actionMessage.type} 
          message={actionMessage.message} 
          className="mb-6" 
        />
      )}
      
      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}
      
      {inquiries.length === 0 && !loading && !error ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-6">
          <p>No inquiries found. When customers submit the contact form, their messages will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input 
                        type="checkbox" 
                        checked={inquiries.length > 0 && selectedIds.size === inquiries.length}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inquiries.map((inquiry) => (
                    <tr 
                      key={inquiry.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedInquiry?.id === inquiry.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isSelected(inquiry.id)}
                          onChange={(e) => toggleSelection(inquiry.id, e as any)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {inquiry.firstName} {inquiry.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inquiry.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inquiry.subject || '(No subject)'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(inquiry.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(inquiry.status)}`}>
                          {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => deleteInquiry(inquiry.id)}
                          className="text-red-600 hover:text-red-900 mr-2"
                          title="Delete"
                          disabled={isDeleting}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="md:col-span-1">
            {selectedInquiry ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-2">
                  {selectedInquiry.subject || '(No subject)'}
                </h2>
                <div className="text-sm text-gray-500 mb-4">
                  From: {selectedInquiry.firstName} {selectedInquiry.lastName} ({selectedInquiry.email})
                  <br />
                  Phone: {selectedInquiry.phone || 'Not provided'}
                  <br />
                  Date: {formatDate(selectedInquiry.createdAt)}
                  <br />
                  Type: {selectedInquiry.inquiryType}
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium mb-2">Message:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button 
                    onClick={() => updateInquiryStatus(selectedInquiry.id, 'responded')}
                    className="px-4 py-2 bg-blue-600 text-white rounded flex items-center hover:bg-blue-700 disabled:bg-blue-300"
                    disabled={isDeleting || selectedInquiry.status === 'responded'}
                  >
                    <FaCheck className="mr-2" />
                    Mark as Responded
                  </button>
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject || 'Your Inquiry'}`}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center hover:bg-gray-300"
                  >
                    <FaEnvelope className="mr-2" />
                    Reply via Email
                  </a>
                  <button
                    onClick={() => deleteInquiry(selectedInquiry.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded flex items-center hover:bg-red-700 disabled:bg-red-300"
                    disabled={isDeleting}
                  >
                    <FaTrash className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 flex items-center justify-center h-full">
                <p className="text-gray-500">Select an inquiry to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
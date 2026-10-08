import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import apiClient from '../lib/api';
import { showToast } from '../components/Toast';
import type { Appointment, AppointmentStatus } from '../types';

const STATUS_SUCCESS_MESSAGES: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Appointment set back to scheduled',
  COMPLETED: 'Appointment marked as completed',
  CANCELLED: 'Appointment cancelled',
  NO_SHOW: 'Appointment marked as no-show',
};

/**
 * Update an appointment's status in the Appointment[] cached under `queryKey`.
 * The change shows immediately and is rolled back if the request fails;
 * all appointment lists are refetched afterwards.
 */
export const useUpdateAppointmentStatus = (queryKey: QueryKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) =>
      apiClient.patch(`/appointments/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Appointment[]>(queryKey);
      queryClient.setQueryData<Appointment[]>(queryKey, (old = []) =>
        old.map((a) => (a.id === id ? { ...a, status } : a))
      );
      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      showToast(err.response?.data?.message || 'Failed to update appointment status', 'error');
    },
    onSuccess: (_res, { status }) => {
      showToast(STATUS_SUCCESS_MESSAGES[status], 'success');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

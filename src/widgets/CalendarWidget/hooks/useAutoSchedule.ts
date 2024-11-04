import { useEffect } from 'react';
import { IEvent } from 'src/entities/Event';
import { useCurrentTrip } from 'src/entities/Trip';
import { useFetch } from 'src/shared/hooks/useFetch';
import { useNotificationService } from 'src/shared/services/notifications';
import { getSchedule } from '../api/schedule';


export const useAutoSchedule = () => {
	const { currentTrip, setCurrentTripEvents } = useCurrentTrip();
	const { Notify } = useNotificationService();

	const {
		isFetching: LoadingSchedule,
		refetch,
		error,
	} = useFetch<IEvent[]>(getSchedule(currentTrip?.id ?? ''));

	const AutoSchedule = () => {
		refetch().then((res) => {
			res && setCurrentTripEvents(res);
		});
	};

	useEffect(() => {
		error && Notify({
			error: true,
			message: error,
		});
	}, [error]);

	return { AutoSchedule, LoadingSchedule };
};

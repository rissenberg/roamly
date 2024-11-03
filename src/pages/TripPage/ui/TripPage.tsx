import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Page404 } from 'src/pages/Page404';
import { EventsList } from 'src/widgets/EventsList';
import { MapWidget } from 'src/widgets/MapWidget';
import { PlacesList } from 'src/widgets/PlacesList';
import { ITrip, TripCard, useCurrentTrip } from 'src/entities/Trip';
import { LoadingScreen } from 'src/shared/components/LoadingScreen';
import { useFetch } from 'src/shared/hooks/useFetch';
import { useNotificationService } from '../../../shared/services/notifications';
import { getTrip } from '../api/getTrip';
import cls from './style.module.scss';

type TMenu = 'places' | 'recoms' | 'calendar' | 'map';

interface ITab {
	menu: TMenu,
	label: string,
	element: ReactNode,
}

export const TripPage = () => {
	const location = useLocation();
	const { id } = useParams();
	const menu = location.hash.replace('#', '');

	const { currentTrip, setCurrentTrip } = useCurrentTrip();
	const { Notify } = useNotificationService();
	const navigate = useNavigate();

	const {
		data,
		error,
	} = useFetch<ITrip>(getTrip(id ?? ''));

	useEffect(() => {
		error && Notify({
			error: true,
			message: error,
		});
	}, [error]);

	useEffect(() => {
		data && setCurrentTrip(data);
	}, [data]);

	const tabs: ITab[] = [
		{
			menu: 'places',
			label: 'Места',
			element: <PlacesList places={currentTrip?.places ?? []} />,
		},
		{
			menu: 'recoms',
			label: 'Рекомендации',
			element: <LoadingScreen />,
		},
		{
			menu: 'calendar',
			label: 'Календарь',
			element: <EventsList events={currentTrip?.events ?? []} />,
		},
		{
			menu: 'map',
			label: 'Карта',
			element: <MapWidget />,
		},
	];

	useEffect(() => {
		if (!tabs.find((item) => item.menu === menu))
			navigate(`${location.pathname}#places`, { replace: true });
	}, [menu]);

	if (error)
		return <Page404 />;

	return (
		<div className={cls.page}>
			{ currentTrip && <TripCard trip={currentTrip} /> }

			<div className={cls.buttonContainer}>
				{tabs.map((tab) => (
					<button
						className={`${cls.tab} ${menu === tab.menu && cls.tabActive}`}
						onClick={() => navigate(`${location.pathname}#${tab.menu}`)}
						key={tab.menu}
					>
						{tab.label}
					</button>
				))}
			</div>

			<div className={cls.content}>
				{ tabs.find((item) => item.menu === menu)?.element }
			</div>

		</div>
	);
};

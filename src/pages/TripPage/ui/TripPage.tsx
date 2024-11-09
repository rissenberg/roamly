import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Page404 } from 'src/pages/Page404';
import { CalendarWidget } from 'src/widgets/CalendarWidget';
import { MainWidget } from 'src/widgets/MainWidget';
import { MapWidget } from 'src/widgets/MapWidget';
import { PlacesList } from 'src/widgets/PlacesList';
import { RecomsList } from 'src/widgets/RecomsList';
import { ITrip, TripCard, useCurrentTrip } from 'src/entities/Trip';
import { useFetch } from 'src/shared/hooks/useFetch';
import { useNotificationService } from 'src/shared/services/notifications';
import { getTrip } from '../api/getTrip';
import cls from './style.module.scss';

type TMenu = 'main' | 'places' | 'recoms' | 'calendar';

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
		isFetching,
	} = useFetch<ITrip>(getTrip(id ?? ''));

	useEffect(() => {
		error && Notify({
			error: true,
			message: error,
		});
	}, [error]);

	useEffect(() => {
		data && setCurrentTrip(data);

		return () => setCurrentTrip(null);
	}, [data]);

	const tabs: ITab[] = [
		{
			menu: 'main',
			label: 'Главная',
			element: <MainWidget />,
		},
		{
			menu: 'recoms',
			label: 'Рекомендации',
			element: <RecomsList />,
		},
		{
			menu: 'calendar',
			label: 'Календарь',
			element: <CalendarWidget events={currentTrip?.events ?? []} />,
		},
		{
			menu: 'places',
			label: 'Места',
			element: <PlacesList places={currentTrip?.places ?? []} />,
		},
	];

	useEffect(() => {
		if (!tabs.find((item) => item.menu === menu))
			navigate(`${location.pathname}#main`, { replace: true });
	}, [menu]);

	if (error)
		return <Page404 />;

	return (
		<div className={cls.page}>
			<TripCard trip={currentTrip} />

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

			{!isFetching &&
				<div className={cls.content}>
					<div className={cls.wrapper}>
						{ currentTrip && tabs.find((item) => item.menu === menu)?.element }
						{ menu !== 'calendar' && <MapWidget /> }
					</div>
				</div>
			}

		</div>
	);
};

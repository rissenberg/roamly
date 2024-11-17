import { MouseEvent, useState } from 'react';
import { TripForm } from 'src/features/TripForm';
import { ModalWrapper } from 'src/shared/components/ModalWrapper';
import { defaultTripName } from 'src/shared/utils';
import { getPlacePhoto } from '../../Place';
import { useCurrentUser, UserRole } from '../../User';
import { isTripActive } from '../lib/tripStates';
import { ITrip } from '../model/types/Trip';
import cls from './style.module.scss';

interface IProps {
  trip: ITrip | null;
  onClick?: () => void;
}

export const TripCard = ({ trip, onClick }: IProps) => {
	const { currentUser } = useCurrentUser();
	const myRole = (currentUser && trip && trip.users.find((u) => u.id === currentUser.id)?.role) ?? UserRole.Readonly;

	const [showModal, setShowModal] = useState(false);

	const isActive = !!trip && isTripActive(trip);

	const handleClickEdit = (e: MouseEvent) => {
		e.stopPropagation();
		setShowModal(true);
	};

	return (
		<div className={`${cls.card} ${onClick && cls.pointer} ${isActive && cls.activeTrip}`} onClick={onClick}>
			{trip?.area.photos?.length ?
				<img className={cls.image} src={getPlacePhoto(trip.area.photos[0])} alt="" /> :
				<div className={cls.image} />
			}
			<div className={cls.info}>
				<div className={cls.name}>
					{trip && (trip.name || defaultTripName(trip?.area.name))}
				</div>

				{trip &&
					<div className={cls.date}>
						Направление: {trip.area.name} <br/>
						{`${trip.startTime.toLocaleDateString()} – ${trip.endTime.toLocaleDateString()}`}
						{isActive && <><br/> Идет прямо сейчас! </>}
					</div>
				}
			</div>

			<div>
				{trip && myRole === UserRole.Owner &&
					<button className="shared-button shared-button-active" onClick={handleClickEdit}>
						Ред.
					</button>
				}
			</div>

			{showModal && trip && myRole === UserRole.Owner &&
				<ModalWrapper onClose={() => setShowModal(false)} >
					<TripForm prevTrip={trip} />
				</ModalWrapper>
			}
		</div>
	);
};
import { MouseEvent, useState } from 'react';
import { ShareForm } from 'src/features/ShareForm';
import { TripForm } from 'src/features/TripForm';
import { UsersList } from 'src/features/UsersList';
import { ModalWrapper } from 'src/shared/components/ModalWrapper';
import { defaultTripName, formatMembersNumber } from 'src/shared/lang';
import { getPlacePhoto } from '../../Place';
import { useCurrentUser, UserRole } from '../../User';
import { isTripActive } from '../lib/tripStates';
import { ITrip } from '../model/types/Trip';
import cls from './style.module.scss';

interface IProps {
  trip: ITrip | null;
	isTripPage?: boolean;
  onClick?: () => void;
}

type TModal = 'edit' | 'members' | 'share';

export const TripCard = ({ trip, isTripPage, onClick }: IProps) => {
	const { currentUser } = useCurrentUser();
	const myRole = (currentUser && trip && trip.users.find((u) => u.id === currentUser.id)?.role) ?? UserRole.Owner;

	const [modalType, setModalType] = useState<TModal | null>(null);

	const isActive = !!trip && isTripActive(trip);

	const handleClickEdit = (e: MouseEvent) => {
		e.stopPropagation();
		setModalType('edit');
	};

	const handleClickMembers = (e: MouseEvent) => {
		e.stopPropagation();
		setModalType('members');
	};

	const handleClickShare = (e: MouseEvent) => {
		e.stopPropagation();
		setModalType('share');
	};

	return (
		<div className={`${cls.card} ${onClick && cls.pointer} ${isActive && cls.activeTrip}`} onClick={onClick}>
			{trip?.area.photos?.length ?
				<img className={cls.image} src={getPlacePhoto(trip.area.photos[0])} alt="" /> :
				<div className={cls.image} />
			}
			{trip &&
				<div className={cls.info}>
					<div className={cls.name}>
						{defaultTripName(trip?.area.name)}
						{myRole === UserRole.Owner &&
							<button className={`shared-button shared-button-active ${cls.editBtn}`} onClick={handleClickEdit}>
								Ред.
							</button>
						}
					</div>

					<div className={cls.date}>
						Направление: {trip.area.name} <br/>
						{`${trip.startTime.toLocaleDateString()} – ${trip.endTime.toLocaleDateString()}`}
						{isActive && <><br/> Идет прямо сейчас! </>}
					</div>

					{isTripPage &&
						<div className={cls.buttonContainer}>
							<button className="shared-button shared-button-active" onClick={handleClickMembers}>
								{formatMembersNumber(trip.users.length)}
							</button>
							{myRole === UserRole.Owner &&
								<button className="shared-button shared-button-active" onClick={handleClickShare}>
									Ссылка приглашение
								</button>
							}
						</div>
					}
				</div>
			}

			{modalType === 'edit' && trip && myRole === UserRole.Owner &&
				<ModalWrapper onClose={() => setModalType(null)} >
					<TripForm prevTrip={trip} />
				</ModalWrapper>
			}
			{modalType === 'members' &&
				<ModalWrapper onClose={() => setModalType(null)} >
					<UsersList users={trip?.users ?? []} />
				</ModalWrapper>
			}
			{modalType === 'share' &&
				<ModalWrapper onClose={() => setModalType(null)} >
					<ShareForm />
				</ModalWrapper>
			}
		</div>
	);
};
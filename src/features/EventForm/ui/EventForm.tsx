import { useMemo, useState, MouseEvent } from 'react';
import { IEvent } from 'src/entities/Event';
import { getPlacePhoto } from 'src/entities/Place';
import { useCurrentTrip } from 'src/entities/Trip';
import { Input } from 'src/shared/components/Input';
import { DAY_MS, dateGreater } from 'src/shared/utils';
import { useCreateUpdateEvent } from '../hooks/useCreateUpdateEvent';
import { useDeleteEvent } from '../hooks/useDeleteEvent';
import cls from './style.module.scss';

interface IProps {
	prevEvent: IEvent | null,
	onSuccess?: () => void,
}

export const EventForm = ({ prevEvent, onSuccess }: IProps) => {
	const { currentTrip, isReader } = useCurrentTrip();

	const tripStart = currentTrip?.endTime.toISOString().slice(0, 16) ?? '';
	const tripEnd = currentTrip ? new Date(+currentTrip.endTime + DAY_MS).toISOString().slice(0, 16) : '';

	const [name, setName] = useState(prevEvent?.name ?? '');
	const [search, setSearch] = useState(prevEvent?.place?.name ?? '');
	const [isSelected, setIsSelected] = useState(!!prevEvent?.place);
	const [startTime, setStartTime] = useState<string | undefined>(prevEvent?.startTime.toISOString().slice(0, 16));
	const [endTime, setEndTime] = useState<string | undefined>(prevEvent?.endTime.toISOString().slice(0, 16));

	const searchResult = useMemo(() => {
		if (!search || !currentTrip)
			return null;

		return currentTrip.places.find((pl) => pl.name.toLowerCase().includes(search.trim().toLowerCase()));
	}, [search]);

	const { Delete } = useDeleteEvent({ onSuccess });
	const { UpdateEvent, CreateEvent } = useCreateUpdateEvent({
		id: prevEvent?.id ?? '',
		name,
		place_id: searchResult?.placeId ?? '',
		trip_id: currentTrip?.id ?? '',
		start_time: startTime ?? '',
		end_time: endTime ?? '',
	});

	const handleCanselSelect = (event: MouseEvent) => {
		event.stopPropagation();
		setIsSelected(false);
	};

	const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const start = e.target.value;
		if (dateGreater(start, tripEnd) || dateGreater(tripStart, start)) {
			setStartTime(tripStart);
			return;
		}
		if (endTime && dateGreater(start, endTime)) {
			setStartTime(endTime);
			return;
		}
		setStartTime(start);
	};

	const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const end = e.target.value;
		if (dateGreater(end, tripEnd) || dateGreater(tripStart, end)) {
			setEndTime(tripEnd);
			return;
		}
		if (startTime && dateGreater(startTime, end)) {
			setEndTime(startTime);
			return;
		}
		setEndTime(end);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentTrip || !startTime || !endTime)
			return;

		const res = !prevEvent ? await CreateEvent() : await UpdateEvent();

		if (res)
			onSuccess?.();
	};

	const imageUrl = isSelected && searchResult?.photos.length && getPlacePhoto(searchResult.photos[0]);

	return (
		<form className={cls.form} onSubmit={handleSubmit}>
			<div className={cls.mainContainer}>

				{imageUrl
					? <img className={cls.image} src={imageUrl}/>
					: <div className={cls.image} />
				}

				<div className={cls.rightContainer}>

					<div className={cls.regionContainer}>
						<span className={cls.hintLabel}> Название события </span>
						<Input
							initValue={name}
							placeholder={isReader ? 'Событие без названия' : 'Введите название'}
							delay={0}
							readonly={isReader}
							onChange={setName}
						/>
					</div>

					<div className={cls.regionContainer}>
						<span className={cls.hintLabel}> Выберите место </span>

						{!isSelected &&
						<Input
							initValue={search}
							placeholder={isReader ? 'Место не выбрано' : 'Выберите место'}
							delay={300}
							readonly={isReader}
							onChange={setSearch}
						/>
						}

						{searchResult && search &&
							<div
								className={`${cls.regionShow} ${!isSelected && !isReader && cls.pointer}`}
								onClick={() => setIsSelected(true)}
							>
								{ searchResult.name }

								{isSelected && !isReader &&
									<div className={cls.cancelBtn} onClick={handleCanselSelect}>
										x
									</div>
								}
							</div>
						}

						{!searchResult && search &&
							<div className={cls.regionShow}>
								<span className={cls.errLabel}>
									Место не найдено
								</span>
							</div>
						}
					</div>
				</div>


			</div>

			<div className={cls.dateContainer}>
				<div className={cls.dateForm}>
					Начало
					<input type="datetime-local" disabled={isReader} value={startTime} onChange={handleStartTimeChange}/>
				</div>

				<div className={cls.dateForm}>
					Конец
					<input type="datetime-local" disabled={isReader} value={endTime} onChange={handleEndTimeChange} />
				</div>
			</div>

			{!isReader &&
				<div className={cls.buttonContainer}>
					<button type="submit" className="shared-button"> {prevEvent ? 'Сохранить' :'Создать'} </button>
					{ prevEvent &&
						<button type="button" className="shared-button shared-button-red" onClick={() => Delete(prevEvent.id)}>
							Удалить
						</button>
					}
				</div>
			}
		</form>
	);
};

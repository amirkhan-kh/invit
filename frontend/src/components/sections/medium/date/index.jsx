import { useEffect, useRef } from 'react';
import './_style.scss';
import MapButton from '../../../../shared/MapButton';
import { parseWeddingDate } from '../../../../types/invitation.types';

// Berilgan oy/yil uchun kalendar kataklarini (bo'sh joylari bilan) hosil qiladi
function buildCalendar(year, month /* 1-12 */) {
  if (!year || !month) return { cells: [], daysInMonth: 0 };
  const first = new Date(year, month - 1, 1);
  // Dushanba = 0 bo'ladigan qilib siljitamiz
  let startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return { cells, daysInMonth };
}

const DateSection = ({ data = {} }) => {
  const ref = useRef(null);
  const {
    date = '',
    venueName = '',
    address = '',
    mapLink = '',
    photos = [],
  } = data;

  const parsed = parseWeddingDate(date);
  const y = parsed.dateObj ? parsed.dateObj.getFullYear() : null;
  const m = parsed.dateObj ? parsed.dateObj.getMonth() + 1 : null;
  const selectedDay = parsed.day ? parseInt(parsed.day, 10) : -1;
  const { cells } = buildCalendar(y, m);

  const venuePhoto = photos && photos[1]; // ixtiyoriy to'yxona/juftlik rasmi

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="secDate" className="min-h-screen text-white">
      <div id="date" className="py-10 relative">
        <div className="flex items-center justify-center gap-10 pt-8 h-36">
          <p className="flex flex-col items-center leading-6">
            Kun<span>{parsed.day || '--'}</span>
          </p>
          <p className="flex flex-col items-center leading-6">
            Oy<span>{parsed.month || '--'}</span>
          </p>
          <p className="flex flex-col items-center leading-6">
            Yil<span>{parsed.year || '----'}</span>
          </p>
        </div>

        {parsed.monthName && (
          <p className="text-center tracking-[4px] uppercase text-sm mb-4 opacity-90">
            {parsed.monthName} {parsed.year} — {parsed.weekday}
          </p>
        )}

        <div className="calendar">
          <div className="weekdays">
            {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((d) => (
              <span className="dayName" key={d}>
                {d}
              </span>
            ))}
          </div>
          <div className="days">
            {cells.map((d, i) => (
              <span key={i} className={d === selectedDay ? 'selected' : ''}>
                {d || ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="adressImgg px-8 py-12 flex items-center justify-between gap-4 overflow-hidden"
      >
        <div className="text-[13px] flex flex-col gap-4 items-start">
          {venueName && <p className="text-lg font-semibold">{venueName}</p>}
          {address && <p className="opacity-90">{address}</p>}
          <MapButton mapLink={mapLink} bg="#ffffff" color="#557693" />
        </div>
        {venuePhoto && (
          <img
            className="rounded-3xl w-32 h-52 object-cover shrink-0"
            src={venuePhoto}
            alt=""
          />
        )}
      </div>
    </section>
  );
};

export default DateSection;

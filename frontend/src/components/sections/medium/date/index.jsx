import  { useEffect, useRef } from "react";
import "./_style.scss";
import { FaMapMarkerAlt } from "react-icons/fa";
const Date = () => {
  const ref = useRef(null);
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
    entry.target.classList.add("animate");
    observer.unobserve(entry.target);
  }
        },
        {
          rootMargin: "-50% 0px -50% 0px",
        }
      );
  
      if (ref.current) observer.observe(ref.current);
  
      return () => observer.disconnect();
    }, []);
  return (
    <section id="secDate" className="min-h-screen bg-[#547792] text-white ">
      <div id="date" className="py-10 ">
        <div className="flex items-center  justify-between gap-10 pt-8 h-36">
          <p className="flex flex-col items-center leading-6">
            Kun<span>02</span>
          </p>
          <p className="flex flex-col items-center leading-6">
            Oy<span>04</span>
          </p>
          <p className="flex flex-col items-center leading-6">
            Yil<span>2024</span>
          </p>
        </div>
        <div className="calendar">
          <div className="weekdays">
            <span className="dayName">M</span>
            <span className="dayName">T</span>
            <span className="dayName">W</span>
            <span className="dayName">Th</span>
            <span className="dayName">F</span>
            <span className="dayName">S</span>
            <span className="dayName">S</span>
          </div>

          <div className="days">
            <span></span>
            <span></span>
            <span>1</span>
            <span className="selected">2</span>
            <span>3</span>
            <span>4</span>

            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
            <span>9</span>
            <span>10</span>
            <span>11</span>

            <span>12</span>
            <span>13</span>
            <span>14</span>
            <span>15</span>
            <span>16</span>
            <span>17</span>
            <span>18</span>

            <span>19</span>
            <span>20</span>
            <span>21</span>
            <span>22</span>
            <span>23</span>
            <span>24</span>
            <span>25</span>

            <span>26</span>
            <span>27</span>
            <span>28</span>
            <span>29</span>
            <span>30</span>
            <span>31</span>
          </div>
        </div>
        <img
          className="absolute -left-20 -top-30 w-82"
          src="/images/optimized/flyflowers.avif"
          alt="flyflowers"
        />
        <img
          className="absolute left-20 top-70 w-82 rotate-12"
          src="/images/optimized/flyflowers.avif"
          alt=""
        />
      </div>
      <div ref={ref} className="adressImgg  px-8 py-12 flex items-center overflow-hidden">
        <div className="text-[12px] flex flex-col gap-4 items-start">
          <p>Beruniy shoh ko'chasi 8A, Тоshkent, Toshkent, Узбекистан</p>
          <a
          className="bg-white rounded-4xl text-[14px] text-[#557693] px-4 py-1 flex items-center gap-2"
          href="">Manzil <FaMapMarkerAlt /></a>
        </div>
        <img
          className="rounded-4xl w-32 h-52 object-cover "
          src="/images/optimized/weddinghall.avif"
          alt="weddinghall"
        />
      </div>
    </section>
  );
};

export default Date;

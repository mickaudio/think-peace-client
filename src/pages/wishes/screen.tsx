import { useState } from "react";
import {endpoints} from "constants/endpoints";
import {Toggle} from "components/partials/Toggle";
import Map from "./map";
import moment from "moment";
import useSWR from "swr";
import {WishSchema} from "interfaces/wish";
import {Music} from "components/multimedia/Music";

const audioCtx = new AudioContext();

const Screen = (props:any) => {

  const [wishList, showWishList] = useState(true);
  const [map, showMap] = useState(false);
  const [fireflies, showFireflies] = useState(true);
  const [music, playMusic] = useState(false);

  // Whether the wishes are stacked or not.
  const [stack, setStack] = useState(true);
  const theme = {
    "name": "Prototype",
    "slug": "prototype",
    "description": "First prototype theme.",
    "author": "Rosuav and Mike iLL",
    "sponsors": ["Center of Wow", "Storybook Sound"],
    "background-sounds": ["drone.mp3"],
    "bg-transition-time": 0.5,
    "hashtags":
    {
      "#peace": {"color": "#cc8800", "sounds": ["Organ_bip.1.mp3", "Organ_bip.2.mp3", "Organ_bip.3.mp3"], "pattern": [3, 55], "image": "#ff00f0"},
      "#love": {"color": "#3f980b", "sounds": ["Organ_bip.4.mp3", "Organ_bip.5.mp3"], "pattern": [23, 610], "image": "#ff00f0"},
      "#hope": {"color": "#b8f57f", "sounds": ["Organ_bip.7.mp3"], "pattern": [13, 987], "image": "#ff00f090"},
      "#faith": {"color": "#f37ff5", "sounds": ["Organ_bip.6.mp3"], "pattern": [3, 610], "image": "#ff00f090"},
      "#friendship": {"color": "#f46796", "sounds": ["Organ_bip.5.mp3", "Organ_bip.8.mp3"], "pattern": [5, 987], "image": "#ff00f090"},
      "#healing": {"color": "#0b6e98", "sounds": ["Organ_bip.6.mp3"], "pattern": [34, 144], "image": "#ff00f090"},
      "#prayers": {"color": "#dabc10", "sounds": ["Organ_bip.7.mp3"], "pattern": [55, 233], "image": "#ff00f090"},
      "#support": {"color": "#a90ebe", "sounds": ["Organ_bip.8.mp3"], "pattern": [89, 377], "image": "#ff00f090"},
      "#respect": {"color": "#af4bf1", "sounds": ["Organ_bip.9.mp3", "Organ_bip.12.mp3", "Organ_bip.13.mp3"], "pattern": [23, 610], "image": "#ff00f090"},
      "default": {"color": "#ff00f0", "sounds": ["Organ_bip.10.mp3", "Organ_bip.11.mp3", "Organ_bip.14.mp3"], "pattern": [13, 987], "image": "#ff00f090"},
    }
  };

  // @ts-ignore
  const fetcher = (...args) => fetch(...args)
    .then((res) => res.json());

  // Data is the wishes array.
  const {data, error, mutate, isLoading} = useSWR(endpoints.wish.GET_ALL, fetcher);

  const darkenByHalf = (color:string) => {
    const newColor = ("000000" + ((parseInt(color.slice(1), 16) / 2) & 0x7f7f7f).toString(16)).slice(-6);
    return "#" + newColor;
  }


  // Totally breakin' the rules here.
  // @ts-ignore
  window.refreshWishes = mutate;
  if (error)
    return (
        <div
          className="py-4 px-6 flex flex-col items-center justify-center text-white"
          style={{ backgroundColor: "#10114C" }}
        >
          <div>failed to load</div>
        </div>
    );
  if (isLoading)
    return (
        <div
          className="py-4 px-6 flex flex-col items-center justify-center text-white"
          style={{ backgroundColor: "#10114C" }}
        >
          <div>loading...</div>
        </div>
    );

  return (
    <div>
      <Toggle label="wishes" set={showWishList} current={ wishList } />
      <Toggle label="map" set={showMap} current={ map } />
      <Toggle label="fireflies" set={showFireflies} current={ fireflies } />
      <Toggle label="music" set={playMusic} current={ music } />
      <div>
        <Music theme={theme} paused={music} audioCtx={audioCtx} />
        {fireflies && data.length > 0 && (
          <ul className="fireflies">
            {data.map((_: WishSchema, idx: number) => {
              //@ts-ignore
              let color = theme.hashtags[_.hashTag].color + "94";
              return (<li
                key={idx}
                style={
                  {
                    "--lr-duration": `${(Math.random() * 12) + 18}s`,
                    "--ud-duration": `${(Math.random() * 8) + 10}s`,
                    "--anim-positioning": `${(Math.random() * -data.length)}s`, // determines where in it's cycle it begins
                    "--anim-delay": `${(Math.random() * idx)}s`,
                    "--anim-color": color,
                  } as React.CSSProperties
                }
              ><svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="15" fill={color} />
                </svg><span style={{color:color}}>{_.hashTag}</span></li>
              )
            })}
          </ul>
        )}

        {wishList && (<div
          className="text-white relative"
          style={{
            backgroundColor: "#10114C",
            // backgroundImage: "url('/assets/background.svg')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top center",
            backgroundSize: "cover",
          }}
        ><section className="px-6 py-12">
              <div className="mt-8">
                {!stack && (
                  <div className="flex justify-end mb-2">
                    <button
                      className="btn btn-circle border-white hover:bg-blue-600 btn-outline btn-sm"
                      onClick={() => setStack(!stack)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#fff"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                <div
                  className={`${stack ? "stack" : ""}`}
                  onClick={() => setStack(!stack)}
                >
                  {data.length > 0 && (
                  <>

                    {[...data]
                      /* Incredibly ineffecient, but it works. Sorting above in the fetcher wasn't working. */
                      .sort((a: WishSchema, b: WishSchema) => a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0)
                        .filter((singleWish: WishSchema) => singleWish.from)
                      .map((wish: WishSchema, idx: number) => {
                        // @ts-ignore
                        let color = theme.hashtags[wish.hashTag].color;
                        // lower the hex amount by x percent
                        const darker = darkenByHalf(color);
                        return <div
                          data-createdat={wish?.createdAt}
                          data-index={idx}
                          key={idx}
                          className="px-6 rounded-md mb-3 text-lg notification-card text-white"
                          style={{background: darker }}
                        >
                          <h4>{`${wish?.hashTag} at ${moment(
                            wish.createdAt
                          ).format("LT")} ${"from " + wish.from?.fullAdress +
                            " to " + wish.to?.fullAdress
                            }`}</h4>
                        </div>
                      })}
                    </>
                  )}
                </div>
              </div>
            </section>
        </div>)}

        {map && <Map markers={props.markers} />}
      </div>
    </div>
  );
};

export default Screen;

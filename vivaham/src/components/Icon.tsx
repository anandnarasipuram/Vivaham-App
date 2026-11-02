import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'calendar'
  | 'guests'
  | 'bag'
  | 'diya'
  | 'wallet'
  | 'bowl'
  | 'stays'
  | 'check';

type Props = { name: IconName; color: string; size?: number };

export default function Icon({ name, color, size = 24 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === 'home' && <Path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />}
      {name === 'calendar' && (
        <>
          <Rect x={3} y={5} width={18} height={16} rx={2} />
          <Path d="M3 10h18M8 3v4M16 3v4" />
        </>
      )}
      {name === 'guests' && (
        <>
          <Circle cx={9} cy={8} r={3.5} />
          <Path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" />
          <Path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.8.7 3 2.5 3.5 5.2" />
        </>
      )}
      {name === 'bag' && (
        <>
          <Path d="M5 8h14l-1 12H6z" />
          <Path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </>
      )}
      {name === 'diya' && (
        <>
          <Path d="M12 3c2 3 3 4.5 3 6a3 3 0 0 1-6 0c0-1.5 1-3 3-6z" />
          <Path d="M4 14h16l-2.5 4h-11z" />
          <Path d="M9 21h6" />
        </>
      )}
      {name === 'wallet' && (
        <>
          <Rect x={3} y={6} width={18} height={14} rx={2} />
          <Path d="M3 10h18M16 15h2" />
        </>
      )}
      {name === 'bowl' && (
        <>
          <Path d="M3 12h18a9 9 0 0 1-18 0z" />
          <Path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4" />
        </>
      )}
      {name === 'stays' && (
        <>
          <Path d="M3 21V8l9-5 9 5v13" />
          <Path d="M9 21v-6h6v6" />
          <Path d="M3 21h18" />
        </>
      )}
      {name === 'check' && (
        <>
          <Rect x={3} y={3} width={18} height={18} rx={3} />
          <Path d="M8 12l3 3 5-6" />
        </>
      )}
    </Svg>
  );
}

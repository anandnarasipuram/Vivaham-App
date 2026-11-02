import Svg, { Path } from 'react-native-svg';

type Props = { direction: 'left' | 'right'; color: string; size?: number };

export default function Chevron({ direction, color, size = 22 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    >
      <Path d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </Svg>
  );
}

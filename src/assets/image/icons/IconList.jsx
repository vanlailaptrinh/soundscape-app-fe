export default function IconList({ height = 16, fill = "var(--black-lv4)" }) {
    return (
        <svg
            viewBox="0 0 16 16"
            height={height}
            fill={fill}
        >
            <path d="M15 14.5H5V13h10zm0-5.75H5v-1.5h10zM15 3H5V1.5h10zM3 3H1V1.5h2zm0 11.5H1V13h2zm0-5.75H1v-1.5h2z" />
        </svg>
    );
}

import "./renderedVideo.css";

export default function RenderedVideo(props: {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
}) {
  return (
    <div className="renderedRoot">
      <video
        className="renderedVideo"
        controls
        playsInline
        preload="metadata"
        src={props.src}
        autoPlay={Boolean(props.autoplay)}
        loop={Boolean(props.loop)}
      />
    </div>
  );
}


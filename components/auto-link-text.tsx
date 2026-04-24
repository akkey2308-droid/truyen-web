type Props = {
  text: string;
};

const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

export default function AutoLinkText({ text }: Props) {
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        const isUrl = urlRegex.test(part);
        urlRegex.lastIndex = 0;

        if (!isUrl) {
          return <span key={index}>{part}</span>;
        }

        const href = part.startsWith("http") ? part : `https://${part}`;

        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 underline underline-offset-4 transition hover:text-amber-300"
          >
            {part}
          </a>
        );
      })}
    </>
  );
}
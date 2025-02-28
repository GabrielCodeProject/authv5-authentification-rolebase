const UnauthorizedMessage = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center m-8 p-6 border border-gray-300 rounded-lg max-w-lg mx-auto text-center">
    <h1 className="text-2xl mb-4">{title}</h1>
    <p className="text-lg">{children}</p>
  </div>
);

export default UnauthorizedMessage;

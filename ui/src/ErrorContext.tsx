import { Toast } from "flowbite-react";
import { createContext, useCallback, useState } from "react";

export type Errors = { [key: string]: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ErrorContext = createContext<{ addError: (error: string) => void }>({ addError: (_) => {} });

export default function ErrorContextProvider({ children }: React.PropsWithChildren) {
  const [errors, setErrors] = useState<Errors>({});

  const removeError = (id: string) => {
    setErrors((e) => {
      if (e[id]) {
        delete e[id];
      }
      return { ...e };
    });
  };

  const addError = useCallback(() => (error: string) => {
    console.error("showing error", error);
    const id = crypto.randomUUID();
    setErrors((e) => {
      return { ...e, [id]: error.toString() };
    });
    // Show the error for 5 seconds, then remove if
    setTimeout(() => {
      removeError(id);
    }, 2500);
  }, []);

  return (
    <ErrorContext.Provider value={{ addError: addError }}>
      <div className="fixed top-4 right-4 flex flex-col gap-4">
        {Object.entries(errors).map(([id, e]) => {
          return (
            <Toast key={id} className="bg-orange-200" style={{ zIndex: 60 }}>
              <span>{e}</span>
              <Toast.Toggle className="bg-orange-200" onDismiss={() => removeError(id)} />
            </Toast>
          );
        })}
      </div>
      {children}
    </ErrorContext.Provider>
  );
}

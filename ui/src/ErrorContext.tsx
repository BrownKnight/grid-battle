import { Toast } from "flowbite-react";
import { createContext, useCallback, useState } from "react";
import { HiExclamation } from "react-icons/hi";

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

  const addError = useCallback((error: string) => {
    console.error("showing error to user", error);
    const id = crypto.randomUUID();
    setErrors((e) => {
      return { ...e, [id]: error?.toString() ?? "Unknown Error" };
    });
    // Show the error for 5 seconds, then remove if
    setTimeout(() => {
      removeError(id);
    }, 5000);
  }, []);

  return (
    <ErrorContext.Provider value={{ addError: addError }}>
      {children}
      <div className="fixed top-4 right-4 flex flex-col gap-4">
        {Object.entries(errors).map(([id, e]) => {
          return (
            <Toast key={id} className="bg-red-700 dark:bg-red-700 text-white dark:text-white" style={{ zIndex: 60 }} >
              <HiExclamation className="h-5 w-10 mr-3" />
              <span>{e}</span>
              <Toast.Toggle className="bg-red-700 dark:bg-red-700 text-white dark:text-white" onDismiss={() => removeError(id)} />
            </Toast>
          );
        })}
      </div>
    </ErrorContext.Provider>
  );
}

import { useState } from "react";

function crearWorker(fn: Function) {
  const blob = new Blob(["onmessage = " + fn.toString()], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}

function workerPrimos(e: MessageEvent<number>) {
  const limite = e.data;
  let primos: number[] = [];
  let esPrimo = new Array(limite + 1).fill(true);
  esPrimo[0] = esPrimo[1] = false;

  for (let i = 2; i * i <= limite; i++) {
    if (esPrimo[i]) {
      for (let j = i * i; j <= limite; j += i) {
        esPrimo[j] = false;
      }
    }
  }

  for (let i = 2; i <= limite; i++) {
    if (esPrimo[i]) primos.push(i);
  }

  postMessage(primos.join(", "));
}

function workerBusqueda(e: MessageEvent<{ parrafo: string; palabra: string }>) {
  const { parrafo, palabra } = e.data;
  let palabras = parrafo
    .toLowerCase()
    .split(/\W+/)
    .filter((p: string) => p.length > 0);
  palabras.sort();

  let izquierda = 0,
    derecha = palabras.length - 1;
  let encontrado = false;

  while (izquierda <= derecha) {
    let medio = Math.floor((izquierda + derecha) / 2);
    if (palabras[medio] === palabra.toLowerCase()) {
      encontrado = true;
      break;
    } else if (palabras[medio] < palabra.toLowerCase()) {
      izquierda = medio + 1;
    } else {
      derecha = medio - 1;
    }
  }

  postMessage(
    encontrado
      ? `La palabra "${palabra}" SÍ se encuentra en el párrafo.`
      : `La palabra "${palabra}" NO se encuentra en el párrafo.`
  );
}

export default function App() {
  const [limite, setLimite] = useState<number>(10);
  const [parrafo, setParrafo] = useState<string>("");
  const [palabra, setPalabra] = useState<string>("");
  const [salida, setSalida] = useState<string>("");

  const procesar = () => {
    setSalida("Procesando...\n");

    if (isNaN(limite) || limite <= 1) {
      setSalida("Ingresa un número mayor a 1 para primos.");
      return;
    }
    if (palabra.trim() === "") {
      setSalida("Ingresa una palabra válida.");
      return;
    }

    const wPrimos = crearWorker(workerPrimos);
    const wBusqueda = crearWorker(workerBusqueda);

    wPrimos.onmessage = (e) => {
      setSalida((prev) => prev + `\nPrimos: ${e.data}`);
    };

    wBusqueda.onmessage = (e) => {
      setSalida((prev) => prev + `\nBúsqueda: ${e.data}`);
    };

    wPrimos.postMessage(limite);
    wBusqueda.postMessage({ parrafo, palabra });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Algoritmo en busqueda binaria</h1>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Límite de primos:</label>
        <input
          type="number"
          value={limite}
          style={styles.input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLimite(parseInt(e.target.value))
          }
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Párrafo:</label>
        <textarea
          value={parrafo}
          style={styles.textarea}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setParrafo(e.target.value)
          }
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Palabra a buscar:</label>
        <input
          value={palabra}
          style={styles.input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPalabra(e.target.value)
          }
        />
      </div>

      <button style={styles.button} onClick={procesar}>
        Generar
      </button>

      <pre style={styles.output}>{salida}</pre>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "30px",
    background: "#fff",
    borderRadius: "15px",
    boxShadow: "0px 5px 20px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    textAlign: "center",
    color: "#0d6efd",
    marginBottom: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "5px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    minHeight: "60px",
    resize: "vertical",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0d6efd",
    color: "#fff",
    fontSize: "18px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  },
  output: {
    marginTop: "20px",
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    whiteSpace: "pre-wrap",
  },
};

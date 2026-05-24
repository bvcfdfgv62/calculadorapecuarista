import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  errorStack: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
    errorStack: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message, errorStack: error.stack || '' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl border border-red-200 p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <span className="text-3xl">⚠️</span> Erro no Aplicativo
            </h1>
            <p className="text-gray-700 mb-6 font-medium text-lg">
              Ocorreu um erro inesperado. Por favor, tire um print desta tela ou copie o erro abaixo e envie para o suporte.
            </p>
            <div className="bg-red-50 p-4 rounded-md overflow-auto border border-red-100 max-h-96">
              <p className="font-bold text-red-800 mb-2 font-mono text-sm">{this.state.errorMessage}</p>
              <pre className="text-xs text-red-600 font-mono whitespace-pre-wrap">{this.state.errorStack}</pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md shadow transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

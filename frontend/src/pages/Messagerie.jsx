// On affiche ici la liste des conversations et le fil de messages de la conversation active
import { useState, useEffect, useRef } from "react";
import { messagesService } from "../services/index.js";
import { useAuth } from "../context/AuthContext.jsx";

const IcôneEnvoi = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IcôneMessage = () => (
  <svg
    className="w-8 h-8 text-gray-300"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// On formate une date en heure ou en date courte selon l'ancienneté du message
const formaterHeure = (dateISO) => {
  const date = new Date(dateISO);
  const maintenant = new Date();
  const diffJ = Math.floor((maintenant - date) / 86400000);
  if (diffJ === 0)
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  if (diffJ === 1) return "Hier";
  if (diffJ < 7) return date.toLocaleDateString("fr-FR", { weekday: "short" });
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const Messagerie = () => {
  const { utilisateur } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [conversationActive, setConversationActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState("");
  const finMessagesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesService
      .getConversations()
      .then((res) => setConversations(res.data))
      .catch((err) =>
        console.error("Erreur chargement conversations :", err.message),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!conversationActive) return;
    messagesService
      .getMessages(
        conversationActive.annonce_id,
        conversationActive.interlocuteur_id,
      )
      .then((res) => setMessages(res.data))
      .catch((err) =>
        console.error("Erreur chargement messages :", err.message),
      );
  }, [conversationActive]);

  useEffect(() => {
    finMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // On remet le focus sur le champ quand on change de conversation
  useEffect(() => {
    if (conversationActive) inputRef.current?.focus();
  }, [conversationActive]);

  const handleEnvoyer = async (e) => {
    e.preventDefault();
    if (!nouveauMessage.trim() || !conversationActive || envoi) return;

    setEnvoi(true);
    setErreurEnvoi("");
    try {
      // On passe explicitement le destinataire_id pour les échanges depuis la messagerie
      // Le backend en a besoin pour les messages qui ne sont pas une première prise de contact
      await messagesService.send({
        contenu: nouveauMessage.trim(),
        annonce_id: conversationActive.annonce_id,
        destinataire_id: conversationActive.interlocuteur_id,
      });

      // On optimiste — on affiche le message immédiatement sans attendre le rechargement
      const messageOptimiste = {
        id: Date.now(),
        contenu: nouveauMessage.trim(),
        date_envoi: new Date().toISOString(),
        expediteur_id: utilisateur?.id,
        expediteur_nom: utilisateur?.nom,
      };
      setMessages((prev) => [...prev, messageOptimiste]);
      setNouveauMessage("");

      // On recharge ensuite pour avoir les vrais IDs et données serveur
      const { data } = await messagesService.getMessages(
        conversationActive.annonce_id,
        conversationActive.interlocuteur_id,
      );
      setMessages(data);
    } catch (err) {
      console.error("Erreur envoi message :", err.message);
      setErreurEnvoi("Impossible d'envoyer le message. Réessayez.");
    } finally {
      setEnvoi(false);
      inputRef.current?.focus();
    }
  };

  // On envoie aussi avec Entrée, Maj+Entrée pour un saut de ligne
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnvoyer(e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messagerie</h1>

      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden"
        style={{ height: "640px" }}
      >
        {/* Colonne gauche : liste des conversations */}
        <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="px-4 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">Conversations</p>
            {conversations.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {conversations.length} conversation
                {conversations.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                <IcôneMessage />
                <p className="text-sm text-gray-400">
                  Aucune conversation pour l'instant.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const estActive =
                  conversationActive?.annonce_id === conv.annonce_id &&
                  conversationActive?.interlocuteur_id ===
                    conv.interlocuteur_id;

                return (
                  <button
                    key={`${conv.annonce_id}-${conv.interlocuteur_id}`}
                    onClick={() => setConversationActive(conv)}
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 ${
                      estActive
                        ? "bg-primary-50 border-l-2 border-l-primary-500"
                        : "hover:bg-gray-50"
                    }`}
                    aria-current={estActive ? "true" : undefined}
                    aria-label={`Conversation avec ${conv.interlocuteur_nom} à propos de ${conv.annonce_titre}`}
                  >
                    {/* Avatar avec initiales */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {conv.interlocuteur_nom?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {conv.interlocuteur_nom}
                          </p>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formaterHeure(conv.date_envoi)}
                          </span>
                        </div>
                        <p className="text-xs text-primary-500 truncate mt-0.5 font-medium">
                          {conv.annonce_titre}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {conv.dernier_message}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Colonne droite : fil de messages */}
        <div className="flex-1 flex flex-col min-w-0">
          {conversationActive ? (
            <>
              {/* En-tête de la conversation */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {conversationActive.interlocuteur_nom
                    ?.charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {conversationActive.interlocuteur_nom}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {conversationActive.annonce_titre}
                  </p>
                </div>
              </div>

              {/* Fil de messages */}
              <div
                className="flex-1 overflow-y-auto px-5 py-4 space-y-2"
                role="log"
                aria-label="Messages de la conversation"
                aria-live="polite"
              >
                {messages.map((msg) => {
                  const estMoi = msg.expediteur_id === utilisateur?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${estMoi ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-sm xl:max-w-md ${estMoi ? "items-end" : "items-start"} flex flex-col gap-1`}
                      >
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            estMoi
                              ? "bg-primary-500 text-white rounded-br-md"
                              : "bg-gray-100 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          {msg.contenu}
                        </div>
                        <time
                          dateTime={msg.date_envoi}
                          className="text-xs text-gray-400 px-1"
                        >
                          {formaterHeure(msg.date_envoi)}
                        </time>
                      </div>
                    </div>
                  );
                })}
                <div ref={finMessagesRef} />
              </div>

              {/* Zone de saisie */}
              <div className="px-4 py-3 border-t border-gray-100">
                {erreurEnvoi && (
                  <p
                    role="alert"
                    className="text-xs text-red-500 mb-2 text-center"
                  >
                    {erreurEnvoi}
                  </p>
                )}
                <form onSubmit={handleEnvoyer} className="flex items-end gap-2">
                  <label htmlFor="nouveau-message" className="sr-only">
                    Votre message
                  </label>
                  <textarea
                    ref={inputRef}
                    id="nouveau-message"
                    value={nouveauMessage}
                    onChange={(e) => setNouveauMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrire un message... (Entrée pour envoyer)"
                    rows={1}
                    className="flex-1 resize-none px-4 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                    style={{ maxHeight: "120px", overflowY: "auto" }}
                  />
                  <button
                    type="submit"
                    disabled={envoi || !nouveauMessage.trim()}
                    aria-label="Envoyer le message"
                    className="w-10 h-10 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0 active:scale-95"
                  >
                    <IcôneEnvoi />
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-1.5 text-center">
                  Entrée pour envoyer · Maj+Entrée pour un saut de ligne
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                <IcôneMessage />
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Vos messages</p>
                <p className="text-sm text-gray-400">
                  Sélectionnez une conversation dans la liste pour afficher les
                  messages.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messagerie;

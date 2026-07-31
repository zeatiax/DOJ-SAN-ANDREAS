import React, { useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Building2, CheckCircle2, FileText, Gavel, LogIn, LogOut, Scale, ShieldCheck, UserRound } from 'lucide-react'
import { isSupabaseConfigured, supabase } from './supabase'
import './styles.css'

const FORM_TYPES = {
  plainte: { label: 'Plainte', prefix: 'PLT' },
  partenariat: { label: 'Partenariat entreprise', prefix: 'ENT' },
  reinsertion: { label: 'Candidature réinsertion', prefix: 'REI' },
}

function createReference(type) {
  const now = new Date()
  const stamp = now.toISOString().slice(0, 10).replaceAll('-', '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${FORM_TYPES[type].prefix}-${stamp}-${random}`
}

function App() {
  const [session, setSession] = useState(null)
  const [activeForm, setActiveForm] = useState('plainte')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dossiers, setDossiers] = useState([])

  const user = session?.user ?? null
  const metadata = user?.user_metadata ?? {}
  const avatar = metadata.avatar_url || metadata.picture
  const displayName = metadata.full_name || metadata.name || metadata.user_name || 'Citoyen'

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user || !supabase) {
      setDossiers([])
      return
    }
    loadDossiers()
  }, [user?.id])

  async function loadDossiers() {
    const { data, error } = await supabase
      .from('submissions')
      .select('id, reference, type, status, created_at')
      .order('created_at', { ascending: false })

    if (!error) setDossiers(data ?? [])
  }

  async function signIn() {
    setMessage(null)
    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase n’est pas encore configuré dans les variables GitHub.' })
      return
    }

    const redirectTo = `${window.location.origin}/DOJ-SAN-ANDREAS/`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo },
    })
    if (error) setMessage({ type: 'error', text: error.message })
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
  }

  async function submitForm(event) {
    event.preventDefault()
    setMessage(null)

    if (!user) {
      setMessage({ type: 'error', text: 'Connecte-toi avec Discord avant d’envoyer un dossier.' })
      document.querySelector('#accueil')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    const form = event.currentTarget
    const fields = Object.fromEntries(new FormData(form).entries())
    const reference = createReference(activeForm)
    setSubmitting(true)

    const { error } = await supabase.from('submissions').insert({
      reference,
      type: activeForm,
      payload: fields,
      discord_name: displayName,
    })

    setSubmitting(false)
    if (error) {
      setMessage({ type: 'error', text: `Envoi impossible : ${error.message}` })
      return
    }

    form.reset()
    setMessage({ type: 'success', text: `Dossier transmis. Référence : ${reference}` })
    loadDossiers()
  }

  const accountLabel = useMemo(() => loading ? 'Chargement…' : user ? displayName : 'Connexion Discord', [loading, user, displayName])

  return (
    <>
      <header className="site-header">
        <div className="wrap navbar">
          <a className="brand" href="#accueil">
            <span className="seal"><Scale size={25} /></span>
            <span><strong>DEPARTMENT OF JUSTICE</strong><small>État de San Andreas</small></span>
          </a>
          <nav>
            <a href="#missions">Missions</a>
            <a href="#reinsertion">Réinsertion</a>
            <a href="#demarches">Démarches</a>
            <a href="#espace">Mon espace</a>
          </nav>
          <button className="discord-button" onClick={user ? signOut : signIn} disabled={loading}>
            {user ? <LogOut size={17} /> : <LogIn size={17} />} {accountLabel}
          </button>
        </div>
      </header>

      <main>
        <section id="accueil" className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow">JUSTICE • INTÉGRITÉ • SERVICE PUBLIC</p>
              <h1>Department of Justice<br /><span>de San Andreas</span></h1>
              <p className="intro">Le DOJ garantit l’application de la loi, la protection des droits et le bon fonctionnement des institutions judiciaires de l’État.</p>
              <div className="actions">
                <a className="button primary" href="#demarches">Déposer une demande</a>
                <a className="button secondary" href="#missions">Découvrir le DOJ</a>
              </div>
            </div>
            <aside className="access-card">
              <span className="official-label">PORTAIL OFFICIEL RP</span>
              {user && avatar ? <img className="avatar" src={avatar} alt="Avatar Discord" /> : <ShieldCheck size={54} />}
              <h2>{user ? `Bienvenue, ${displayName}` : 'Accès citoyen sécurisé'}</h2>
              <p>{user ? 'Ton identité Discord est vérifiée. Tu peux transmettre et suivre tes dossiers.' : 'Connecte-toi avec Discord pour authentifier tes demandes et accéder à leur suivi.'}</p>
              <button className="discord-button large" onClick={user ? signOut : signIn}>{user ? <><LogOut size={18} /> Déconnexion</> : <><LogIn size={18} /> Se connecter avec Discord</>}</button>
              <small>Aucun mot de passe Discord n’est enregistré par le site.</small>
            </aside>
          </div>
        </section>

        <section id="missions" className="section">
          <div className="wrap">
            <p className="eyebrow dark">NOS MISSIONS</p>
            <h2 className="section-title">Une institution judiciaire accessible et structurée</h2>
            <div className="cards">
              <article><Gavel /><h3>Justice et audiences</h3><p>Organisation des audiences, suivi des procédures et publication des décisions judiciaires.</p></article>
              <article><FileText /><h3>Plaintes et signalements</h3><p>Réception sécurisée des plaintes et transmission des dossiers au parquet pour examen.</p></article>
              <article><UserRound /><h3>Réinsertion</h3><p>Accompagnement des citoyens souhaitant reprendre une activité professionnelle stable et légale.</p></article>
            </div>
          </div>
        </section>

        <section id="reinsertion" className="section navy-section">
          <div className="wrap split">
            <div>
              <p className="eyebrow">PÔLE DE RÉINSERTION</p>
              <h2 className="section-title">Une seconde chance peut changer une vie</h2>
              <p>Le Pôle de Réinsertion aide les citoyens à reconstruire durablement leur avenir grâce à un accompagnement judiciaire et professionnel.</p>
              <ul className="feature-list">
                <li><CheckCircle2 /><span><b>25 % du coût salarial remboursé</b><br />Une partie du coût est prise en charge par le programme.</span></li>
                <li><CheckCircle2 /><span><b>Accompagnement par le DOJ</b><br />Suivi du candidat, échanges avec l’employeur et médiation.</span></li>
                <li><CheckCircle2 /><span><b>Possibilité d’embauche durable</b><br />La période peut déboucher sur un contrat classique.</span></li>
              </ul>
            </div>
            <aside className="partner-card">
              <Building2 size={38} />
              <h3>Entreprises partenaires</h3>
              <p>Offrez une opportunité concrète tout en bénéficiant d’un accompagnement administratif et financier.</p>
              <a className="button primary" href="#demarches" onClick={() => setActiveForm('partenariat')}>Proposer un partenariat</a>
            </aside>
          </div>
        </section>

        <section id="demarches" className="section">
          <div className="wrap">
            <p className="eyebrow dark">PORTAIL DES DÉMARCHES</p>
            <h2 className="section-title">Transmettre un dossier au DOJ</h2>
            <p className="lead">Une connexion Discord est nécessaire pour authentifier l’auteur de chaque demande.</p>
            <div className="tabs">
              {Object.entries(FORM_TYPES).map(([key, value]) => (
                <button key={key} className={activeForm === key ? 'tab active' : 'tab'} onClick={() => { setActiveForm(key); setMessage(null) }}>{value.label}</button>
              ))}
            </div>
            <div className="form-panel">
              {activeForm === 'plainte' && <ComplaintForm onSubmit={submitForm} submitting={submitting} />}
              {activeForm === 'partenariat' && <PartnerForm onSubmit={submitForm} submitting={submitting} />}
              {activeForm === 'reinsertion' && <ReintegrationForm onSubmit={submitForm} submitting={submitting} />}
              {message && <div className={`notice ${message.type}`}>{message.text}</div>}
            </div>
          </div>
        </section>

        <section id="espace" className="section account-section">
          <div className="wrap">
            <p className="eyebrow dark">ESPACE CITOYEN</p>
            <h2 className="section-title">Mes dossiers</h2>
            {!user ? (
              <div className="empty-state"><ShieldCheck size={45} /><h3>Connecte-toi pour accéder à ton espace</h3><p>Consulte tes références, leur statut et leur date de dépôt.</p><button className="discord-button large" onClick={signIn}><LogIn size={18} /> Connexion Discord</button></div>
            ) : (
              <>
                <div className="profile-card">{avatar && <img className="avatar small" src={avatar} alt="Avatar Discord" />}<div><strong>{displayName}</strong><span>{user.email || 'Compte Discord authentifié'}</span></div></div>
                <div className="dossier-list">
                  {dossiers.length === 0 ? <div className="empty-state compact"><FileText size={36} /><h3>Aucun dossier pour le moment</h3></div> : dossiers.map(item => (
                    <article key={item.id}><div><strong>{item.reference}</strong><span>{FORM_TYPES[item.type]?.label ?? item.type}</span></div><div><span className={`status ${item.status}`}>{item.status}</span><time>{new Date(item.created_at).toLocaleDateString('fr-FR')}</time></div></article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <footer><div className="wrap footer-grid"><div><strong>Department of Justice — San Andreas</strong><span>Justice, intégrité et service public.</span></div><div>© 2026 • Site fictif destiné au roleplay.</div></div></footer>

      {!isSupabaseConfigured && <div className="config-warning">Configuration Supabase manquante : ajoute les variables dans GitHub Actions.</div>}
    </>
  )
}

const Field = ({ label, name, type = 'text', required = true, ...props }) => <label>{label}<input name={name} type={type} required={required} {...props} /></label>

function ComplaintForm({ onSubmit, submitting }) {
  return <form onSubmit={onSubmit}><div className="grid"><Field label="Nom du plaignant" name="plaignant" maxLength="100" /><Field label="Téléphone" name="telephone" maxLength="30" /><Field label="Personne mise en cause" name="mis_en_cause" maxLength="100" /><Field label="Date des faits" name="date_faits" type="date" /></div><label>Résumé détaillé des faits<textarea name="faits" rows="7" required maxLength="5000" /></label><div className="grid"><Field label="Témoins" name="temoins" required={false} maxLength="500" /><Field label="Liens vers les preuves" name="preuves" required={false} maxLength="1000" placeholder="Images, vidéos ou documents" /></div><button className="submit-button" disabled={submitting}>{submitting ? 'Envoi en cours…' : 'Envoyer la plainte'}</button></form>
}
function PartnerForm({ onSubmit, submitting }) {
  return <form onSubmit={onSubmit}><div className="grid"><Field label="Entreprise" name="entreprise" maxLength="120" /><Field label="Responsable" name="responsable" maxLength="100" /><Field label="Téléphone" name="telephone" maxLength="30" /><Field label="Poste proposé" name="poste" maxLength="120" /></div><label>Présentation et besoins<textarea name="description" rows="7" required maxLength="5000" /></label><button className="submit-button" disabled={submitting}>{submitting ? 'Envoi en cours…' : 'Envoyer la demande'}</button></form>
}
function ReintegrationForm({ onSubmit, submitting }) {
  return <form onSubmit={onSubmit}><div className="grid"><Field label="Nom et prénom" name="nom" maxLength="100" /><Field label="Téléphone" name="telephone" maxLength="30" /><Field label="Domaines recherchés" name="domaines" maxLength="300" /><Field label="Disponibilités" name="disponibilites" maxLength="300" /></div><label>Motivation et projet professionnel<textarea name="motivation" rows="7" required maxLength="5000" /></label><button className="submit-button" disabled={submitting}>{submitting ? 'Envoi en cours…' : 'Envoyer la candidature'}</button></form>
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)

import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  BuildingStorefrontIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  Cog6ToothIcon,
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { generateChainReportPDF, downloadPDF } from '../../utils/pdfGenerator';

// Composant graphique pour les sites
const SitesDetailChart = () => (
  <div className="space-y-6">
    {/* Header avec métriques */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
      <h3 className="text-xl font-bold mb-2">Analyse des Sites</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">5</div>
          <div className="text-blue-100 text-sm">Sites Actifs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">87%</div>
          <div className="text-blue-100 text-sm">Performance Moyenne</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">+12%</div>
          <div className="text-blue-100 text-sm">Croissance</div>
        </div>
      </div>
    </div>

    {/* Graphique en barres performance par site */}
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Performance par Site</h4>
      <div className="space-y-4">
        {[
          { site: 'Paris Centre', score: 92, ca: 75000, color: '#10B981', status: 'Excellent' },
          { site: 'Lyon Part-Dieu', score: 88, ca: 54000, color: '#3B82F6', status: 'Très Bon' },
          { site: 'Toulouse Centre', score: 85, ca: 45000, color: '#F59E0B', status: 'Bon' },
          { site: 'Nice Promenade', score: 82, ca: 33000, color: '#F97316', status: 'Moyen' },
          { site: 'Marseille V.Port', score: 78, ca: 36000, color: '#EF4444', status: 'À Améliorer' }
        ].map((site, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-32 font-medium text-gray-700">{site.site}</div>
            
            {/* Barre de performance */}
            <div className="flex-1 relative">
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div 
                  className="h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{ 
                    width: `${site.score}%`, 
                    backgroundColor: site.color,
                    boxShadow: `0 0 10px ${site.color}40`
                  }}
                >
                  <span className="text-white text-xs font-bold">{site.score}%</span>
                </div>
              </div>
            </div>
            
            {/* Métriques */}
            <div className="text-right min-w-[120px]">
              <div className="font-semibold text-gray-800">{site.ca.toLocaleString()}€</div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                site.score >= 90 ? 'bg-green-100 text-green-800' :
                site.score >= 85 ? 'bg-blue-100 text-blue-800' :
                site.score >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                {site.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Graphique d'évolution */}
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Évolution Performance (3 mois)</h4>
      <div className="h-64 relative">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grille */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#grid)" />
          
          {/* Lignes de données */}
          {[
            { name: 'Paris', points: '50,40 150,35 250,30 350,25', color: '#10B981' },
            { name: 'Lyon', points: '50,60 150,55 250,50 350,45', color: '#3B82F6' },
            { name: 'Toulouse', points: '50,80 150,75 250,70 350,65', color: '#F59E0B' },
            { name: 'Nice', points: '50,100 150,95 250,90 350,85', color: '#F97316' },
            { name: 'Marseille', points: '50,120 150,115 250,110 350,105', color: '#EF4444' }
          ].map((line, index) => (
            <g key={index}>
              <polyline
                fill="none"
                stroke={line.color}
                strokeWidth="3"
                points={line.points}
                className="drop-shadow-sm"
              />
              {line.points.split(' ').map((point, pointIndex) => {
                const [x, y] = point.split(',');
                return (
                  <circle
                    key={pointIndex}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={line.color}
                    className="drop-shadow-sm"
                  />
                );
              })}
            </g>
          ))}
          
          {/* Labels */}
          <text x="50" y="190" textAnchor="middle" className="text-xs fill-gray-600">Oct</text>
          <text x="150" y="190" textAnchor="middle" className="text-xs fill-gray-600">Nov</text>
          <text x="250" y="190" textAnchor="middle" className="text-xs fill-gray-600">Déc</text>
          <text x="350" y="190" textAnchor="middle" className="text-xs fill-gray-600">Jan</text>
        </svg>
      </div>
      
      {/* Légende */}
      <div className="flex flex-wrap gap-4 mt-4">
        {[
          { name: 'Paris', color: '#10B981' },
          { name: 'Lyon', color: '#3B82F6' },
          { name: 'Toulouse', color: '#F59E0B' },
          { name: 'Nice', color: '#F97316' },
          { name: 'Marseille', color: '#EF4444' }
        ].map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-sm text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Composant graphique pour le CA
const RevenueDetailChart = () => (
  <div className="space-y-6">
    {/* Header avec métriques */}
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
      <h3 className="text-xl font-bold mb-2">Analyse Financière</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">125k€</div>
          <div className="text-green-100 text-sm">CA Mensuel</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">+12%</div>
          <div className="text-green-100 text-sm">Croissance</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">96%</div>
          <div className="text-green-100 text-sm">Objectif Atteint</div>
        </div>
      </div>
    </div>

    {/* Graphique en secteurs (Donut Chart) */}
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Répartition CA par Site</h4>
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-64">
          <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
            {/* Cercle de base */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="#f3f4f6" strokeWidth="20"/>
            
            {/* Segments colorés */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="#10B981" strokeWidth="20"
                    strokeDasharray="150.8 502.4" strokeDashoffset="0" className="drop-shadow-lg"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#3B82F6" strokeWidth="20"
                    strokeDasharray="108.6 502.4" strokeDashoffset="-150.8" className="drop-shadow-lg"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#F59E0B" strokeWidth="20"
                    strokeDasharray="90.5 502.4" strokeDashoffset="-259.4" className="drop-shadow-lg"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#F97316" strokeWidth="20"
                    strokeDasharray="72.4 502.4" strokeDashoffset="-349.9" className="drop-shadow-lg"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#EF4444" strokeWidth="20"
                    strokeDasharray="66.3 502.4" strokeDashoffset="-422.3" className="drop-shadow-lg"/>
          </svg>
          
          {/* Centre avec total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-800">125k€</div>
            <div className="text-sm text-gray-500">Total Mensuel</div>
          </div>
        </div>
      </div>
      
      {/* Légende détaillée */}
      <div className="grid grid-cols-1 gap-3 mt-6">
        {[
          { site: 'Paris Centre', ca: 75000, percent: 60, color: '#10B981' },
          { site: 'Lyon Part-Dieu', ca: 54000, percent: 43, color: '#3B82F6' },
          { site: 'Toulouse Centre', ca: 45000, percent: 36, color: '#F59E0B' },
          { site: 'Marseille V.Port', ca: 36000, percent: 29, color: '#F97316' },
          { site: 'Nice Promenade', ca: 33000, percent: 26, color: '#EF4444' }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="font-medium text-gray-700">{item.site}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800">{item.ca.toLocaleString()}€</div>
              <div className="text-sm text-gray-500">{item.percent}% du total</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Graphique de prévisions */}
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Prévisions Trimestrielles</h4>
      <div className="h-48 flex items-end justify-center space-x-8">
        {[
          { mois: 'Jan', montant: 135000, croissance: 8, color: '#10B981' },
          { mois: 'Fév', montant: 142000, croissance: 5, color: '#3B82F6' },
          { mois: 'Mar', montant: 146000, croissance: 3, color: '#6366F1' }
        ].map((prev, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="relative mb-2">
              <div 
                className="w-16 rounded-t-lg shadow-lg transition-all duration-1000 ease-out"
                style={{ 
                  height: `${(prev.montant / 150000) * 160}px`,
                  background: `linear-gradient(to top, ${prev.color}, ${prev.color}80)`
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-semibold">
                  +{prev.croissance}%
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">{prev.mois}</div>
              <div className="text-sm text-gray-500">{(prev.montant / 1000)}k€</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Composant graphique pour le Score de Performance
const ScoreDetailChart = () => (
  <div className="space-y-6">
    {/* Header avec métriques */}
    <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-6 text-white">
      <h3 className="text-xl font-bold mb-2">Évaluation Performance</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">85%</div>
          <div className="text-orange-100 text-sm">Score Global</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">90%</div>
          <div className="text-orange-100 text-sm">Objectif</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">+1%</div>
          <div className="text-orange-100 text-sm">Ce Mois</div>
        </div>
      </div>
    </div>

    {/* Détail des scores */}
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Évaluation par Critères</h4>
      <div className="grid grid-cols-1 gap-3">
        {[
          { critere: 'Propreté/Hygiène', score: 95, color: '#10B981', icon: '•' },
          { critere: 'Qualité produits', score: 92, color: '#059669', icon: '•' },
          { critere: 'Service client', score: 88, color: '#F59E0B', icon: '•' },
          { critere: 'Présentation', score: 85, color: '#F97316', icon: '•' },
          { critere: 'Temps d\'attente', score: 78, color: '#EF4444', icon: '•' }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-gray-700">{item.critere}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${item.score}%`, 
                    backgroundColor: item.color,
                    boxShadow: `0 0 8px ${item.color}40`
                  }}
                ></div>
              </div>
              <span className="font-bold text-gray-800 w-12 text-right">{item.score}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Composant graphique pour la Conformité
const ComplianceDetailChart = () => (
  <div className="space-y-6">
    {/* Header avec métriques */}
    <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl p-6 text-white">
      <h3 className="text-xl font-bold mb-2">Audit de Conformité</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">95%</div>
          <div className="text-purple-100 text-sm">Conformité</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">3</div>
          <div className="text-purple-100 text-sm">Non-conformités</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">98%</div>
          <div className="text-purple-100 text-sm">Objectif</div>
        </div>
      </div>
    </div>

    {/* Graphique de conformité par site */}
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Conformité par Site</h4>
      <div className="space-y-4">
        {[
          { site: 'Paris Centre', score: 98, status: 'Conforme', color: '#10B981', icon: '•' },
          { site: 'Lyon Part-Dieu', score: 96, status: 'Conforme', color: '#059669', icon: '•' },
          { site: 'Toulouse Centre', score: 94, status: 'Attention', color: '#F59E0B', icon: '•' },
          { site: 'Nice Promenade', score: 92, status: 'Attention', color: '#F97316', icon: '•' },
          { site: 'Marseille V.Port', score: 88, status: 'Non-conforme', color: '#EF4444', icon: '•' }
        ].map((site, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">{site.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{site.site}</div>
              <div className="text-sm text-gray-500">{site.status}</div>
            </div>
            
            {/* Jauge circulaire */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="25" fill="none" stroke="#E5E7EB" strokeWidth="6"/>
                <circle 
                  cx="30" 
                  cy="30" 
                  r="25" 
                  fill="none" 
                  stroke={site.color}
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 25}`}
                  strokeDashoffset={`${2 * Math.PI * 25 * (1 - site.score / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out drop-shadow-sm"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800">{site.score}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Plan d'action */}
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Plan d'Action Correctif</h4>
      <div className="space-y-3">
        {[
          { action: 'Audit surprise Marseille', date: '15 Jan', status: 'Planifié', color: '#EF4444' },
          { action: 'Formation procédures', date: '20 Jan', status: 'En cours', color: '#3B82F6' },
          { action: 'Mise à jour check-lists', date: '25 Jan', status: 'À faire', color: '#6B7280' },
          { action: 'Suivi hebdomadaire', date: 'Continu', status: 'Actif', color: '#10B981' }
        ].map((action, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: action.color }}
              ></div>
              <span className="font-medium text-gray-700">{action.action}</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">{action.date}</div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                action.status === 'Actif' ? 'bg-green-100 text-green-800' :
                action.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                action.status === 'Planifié' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {action.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ChainManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '', type: '' });

  const { data: chainData, isLoading } = useQuery(
    'chainData',
    () => axios.get('/api/chains/dashboard').then(res => res.data)
  );

  const showModal = (title, content, type = 'info') => {
    setModalContent({ title, content, type });
    setShowDetailModal(true);
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: ChartBarIcon },
    { id: 'sites', name: 'Gestion Sites', icon: BuildingStorefrontIcon },
    { id: 'standards', name: 'Standards', icon: DocumentCheckIcon },
    { id: 'audits', name: 'Audits', icon: Cog6ToothIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion Chaîne</h1>
        <p className="text-gray-600">
          Pilotage multi-sites et standardisation
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <ChainOverview data={chainData} showModal={showModal} />}
        {activeTab === 'sites' && <SitesManagement data={chainData?.sites} showModal={showModal} />}
        {activeTab === 'standards' && <StandardsManagement showModal={showModal} />}
        {activeTab === 'audits' && <AuditsManagement showModal={showModal} />}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowDetailModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                    modalContent.type === 'success' ? 'bg-green-100' :
                    modalContent.type === 'warning' ? 'bg-yellow-100' :
                    modalContent.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                  } sm:mx-0 sm:h-10 sm:w-10`}>
                    {modalContent.type === 'success' && (
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {modalContent.type === 'warning' && (
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                    {(modalContent.type === 'info' || !modalContent.type) && (
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {modalContent.title}
                    </h3>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500">
                        {typeof modalContent.content === 'string' ? (
                          <div className="whitespace-pre-line">{modalContent.content}</div>
                        ) : (
                          modalContent.content
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ChainOverview = ({ data, showModal }) => {
  const sites = data?.sites || [];
  const performance = data?.performance || {};

  return (
    <div className="space-y-6">
      {/* KPIs Graphiques Interactifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Sites Total - Graphique en barres */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105" 
             onClick={() => showModal('Analyse Détaillée des Sites', <SitesDetailChart />, 'info')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <BuildingStorefrontIcon className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-600 font-medium">+2 ce mois</div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Sites Total</h3>
          <div className="flex items-end space-x-1 mb-3 h-12">
            {[92, 88, 85, 82, 78].map((height, index) => (
              <div key={index} className="flex-1 bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity" 
                   style={{ height: `${height}%` }}></div>
            ))}
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold text-blue-700">{sites.length}</span>
            <div className="text-sm text-blue-600">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                +12%
              </span>
            </div>
          </div>
        </div>

        {/* CA Total - Graphique en aires */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
             onClick={() => showModal('Analyse Chiffre d\'Affaires', <RevenueDetailChart />, 'success')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-xl shadow-lg">
              <CurrencyEuroIcon className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-xs text-green-600 font-medium">Objectif: 96%</div>
              <div className="w-16 bg-green-200 rounded-full h-2">
                <div className="w-full h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-green-900 mb-2">CA Total</h3>
          <div className="relative h-12 mb-3">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                </linearGradient>
              </defs>
              <path d="M0,35 Q25,25 50,20 T100,15 L100,40 L0,40 Z" fill="url(#revenueGradient)" />
              <path d="M0,35 Q25,25 50,20 T100,15" stroke="#10b981" strokeWidth="2" fill="none" />
              <circle cx="100" cy="15" r="3" fill="#059669" />
            </svg>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold text-green-700">{(performance.totalRevenue || 125000).toLocaleString()}€</span>
            <div className="text-sm text-green-600">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                +12%
              </span>
            </div>
          </div>
        </div>

        {/* Score Moyen - Graphique circulaire */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-6 shadow-xl border border-orange-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
             onClick={() => showModal('Évaluation Performance Détaillée', <ScoreDetailChart />, 'warning')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-xs text-orange-600 font-medium">Objectif: 90%</div>
              <div className="flex space-x-1">
                {[1,2,3,4].map((star, index) => (
                  <div key={index} className={`w-2 h-2 rounded-full ${index < 3 ? 'bg-orange-400' : 'bg-orange-200'}`}></div>
                ))}
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-orange-900 mb-2">Score Moyen</h3>
          <div className="flex items-center justify-center mb-3">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#fed7aa" strokeWidth="8" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#f97316" strokeWidth="8" fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - (performance.avgScore || 85) / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-orange-700">{performance.avgScore || 85}%</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
              <ClockIcon className="h-3 w-3 mr-1" />
              +1% ce mois
            </span>
          </div>
        </div>

        {/* Conformité - Graphique en jauge */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
             onClick={() => showModal('Audit de Conformité Détaillé', <ComplianceDetailChart />, 'info')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-xs text-purple-600 font-medium">3 actions</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Conformité</h3>
          <div className="relative mb-3">
            <div className="w-full bg-purple-200 rounded-full h-4">
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                   style={{ width: `${performance.compliance || 95}%` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-purple-600 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold text-purple-700">{performance.compliance || 95}%</span>
            <div className="text-sm text-purple-600">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                -3% obj.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sites Performance - Tableau Interactif */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Performance par site</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CA Jour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sites.map((site, index) => (
                <tr key={site.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {site.name || `Site ${index + 1}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {site.location || 'Paris'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{site.dailyRevenue || '2,450'}€</div>
                    <div className="text-sm text-gray-500">+5.2% vs hier</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{site.score || 85}%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${site.score || 85}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (site.score || 85) >= 90 ? 'bg-green-100 text-green-800' :
                      (site.score || 85) >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {(site.score || 85) >= 90 ? 'Excellent' :
                       (site.score || 85) >= 80 ? 'Bon' : 'À améliorer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => showModal(`Détail ${site.name || `Site ${index + 1}`}`, 
                        `PERFORMANCE DÉTAILLÉE\n\n` +
                        `Site: ${site.name || `Site ${index + 1}`}\n` +
                        `Localisation: ${site.location || 'Paris'}\n` +
                        `CA Journalier: ${site.dailyRevenue || '2,450'}€\n` +
                        `Score Performance: ${site.score || 85}%\n\n` +
                        `Détails:\n` +
                        `   • Équipe: ${site.staff || 8} personnes\n` +
                        `   • Ouverture: ${site.openingHours || '7h-22h'}\n` +
                        `   • Surface: ${site.surface || 120}m²\n` +
                        `   • Places: ${site.seats || 45} couverts\n\n` +
                        `Actions recommandées:\n` +
                        `   • Optimisation des horaires\n` +
                        `   • Formation équipe\n` +
                        `   • Amélioration service`, 'info')}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Composants pour les autres onglets
const SitesManagement = ({ data, showModal }) => (
  <div className="text-center py-8">
    <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des Sites</h3>
    <p className="text-gray-500">Fonctionnalité en développement</p>
  </div>
);

const StandardsManagement = ({ showModal }) => (
  <div className="text-center py-8">
    <h3 className="text-lg font-medium text-gray-900 mb-2">Standards</h3>
    <p className="text-gray-500">Fonctionnalité en développement</p>
  </div>
);

const AuditsManagement = ({ showModal }) => (
  <div className="text-center py-8">
    <h3 className="text-lg font-medium text-gray-900 mb-2">Audits</h3>
    <p className="text-gray-500">Fonctionnalité en développement</p>
  </div>
);



export default ChainManagement;
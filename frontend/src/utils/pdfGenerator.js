import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (title, data, columns, options = {}) => {
  const doc = new jsPDF();
  
  // Configuration par défaut
  const defaultOptions = {
    orientation: 'portrait',
    format: 'a4',
    margin: 20,
    fontSize: 12,
    headerColor: [41, 128, 185], // Bleu
    textColor: [0, 0, 0], // Noir
    ...options
  };

  // En-tête du document
  doc.setFontSize(18);
  doc.setTextColor(defaultOptions.headerColor[0], defaultOptions.headerColor[1], defaultOptions.headerColor[2]);
  doc.text('RestaurantPro', defaultOptions.margin, 25);
  
  doc.setFontSize(14);
  doc.setTextColor(defaultOptions.textColor[0], defaultOptions.textColor[1], defaultOptions.textColor[2]);
  doc.text(title, defaultOptions.margin, 40);
  
  // Date de génération
  doc.setFontSize(10);
  doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, defaultOptions.margin, 50);
  
  // Tableau des données
  if (data && data.length > 0) {
    doc.autoTable({
      head: [columns],
      body: data,
      startY: 60,
      margin: { left: defaultOptions.margin, right: defaultOptions.margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: defaultOptions.headerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
      },
    });
  }
  
  // Pied de page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} sur ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
  }
  
  return doc;
};

export const generateChainReportPDF = (chainData) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(41, 128, 185);
  doc.text('RestaurantPro - Rapport Consolidé Chaîne', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 20, 40);
  
  // Métriques principales
  let yPosition = 60;
  doc.setFontSize(14);
  doc.setTextColor(41, 128, 185);
  doc.text('Métriques Principales', 20, yPosition);
  
  yPosition += 15;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const metrics = [
    ['Sites Total', '5 sites actifs'],
    ['Chiffre d\'Affaires Total', '125 000€ (mensuel)'],
    ['Score Moyen Performance', '85%'],
    ['Taux de Conformité', '95%'],
    ['Croissance', '+12% vs mois précédent']
  ];
  
  metrics.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 25, yPosition);
    yPosition += 10;
  });
  
  // Performance par site
  yPosition += 10;
  doc.setFontSize(14);
  doc.setTextColor(41, 128, 185);
  doc.text('Performance par Site', 20, yPosition);
  
  const siteData = [
    ['Paris Centre', '75 000€', '92%', 'Excellent'],
    ['Lyon Part-Dieu', '54 000€', '88%', 'Très Bon'],
    ['Toulouse Centre', '45 000€', '85%', 'Bon'],
    ['Nice Promenade', '33 000€', '82%', 'Moyen'],
    ['Marseille V.Port', '36 000€', '78%', 'À Améliorer']
  ];
  
  doc.autoTable({
    head: [['Site', 'CA Mensuel', 'Score', 'Statut']],
    body: siteData,
    startY: yPosition + 10,
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });
  
  // Recommandations
  yPosition = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.setTextColor(41, 128, 185);
  doc.text('Recommandations', 20, yPosition);
  
  yPosition += 15;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const recommendations = [
    '• Améliorer les performances du site de Marseille (score 78%)',
    '• Optimiser les processus pour atteindre 98% de conformité',
    '• Capitaliser sur le succès du site de Paris pour les autres',
    '• Former les équipes sur les standards de qualité',
    '• Mettre en place un suivi hebdomadaire des KPIs'
  ];
  
  recommendations.forEach(rec => {
    doc.text(rec, 25, yPosition);
    yPosition += 8;
  });
  
  return doc;
};

export const generateInventoryPDF = (inventoryData) => {
  const columns = ['Produit', 'Stock Actuel', 'Stock Min', 'Prix Unitaire', 'Valeur Total', 'Statut', 'Date Expiration'];
  
  const data = inventoryData.map(item => [
    item.name || 'N/A',
    `${item.currentStock || 0} ${item.unit || ''}`,
    `${item.minStock || 0} ${item.unit || ''}`,
    `${item.unitPrice || 0}€`,
    `${((item.currentStock || 0) * (item.unitPrice || 0)).toFixed(2)}€`,
    item.status || 'N/A',
    item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('fr-FR') : 'N/A'
  ]);
  
  return generatePDF('Rapport d\'Inventaire', data, columns);
};

export const generateRecipesPDF = (recipesData) => {
  const columns = ['Recette', 'Catégorie', 'Temps Prep', 'Portions', 'Coût', 'Prix Vente', 'Marge'];
  
  const data = recipesData.map(recipe => [
    recipe.name || 'N/A',
    recipe.category || 'N/A',
    `${recipe.preparationTime || 0} min`,
    recipe.servings || 0,
    `${recipe.cost || 0}€`,
    `${recipe.price || 0}€`,
    `${recipe.margin || 0}%`
  ]);
  
  return generatePDF('Rapport des Recettes', data, columns);
};

export const generateOrdersPDF = (ordersData) => {
  const columns = ['N° Commande', 'Date', 'Client', 'Articles', 'Total', 'Statut'];
  
  const data = ordersData.map(order => [
    order.orderNumber || 'N/A',
    order.date ? new Date(order.date).toLocaleDateString('fr-FR') : 'N/A',
    order.customer || 'N/A',
    order.items?.length || 0,
    `${order.total || 0}€`,
    order.status || 'N/A'
  ]);
  
  return generatePDF('Rapport des Commandes', data, columns);
};

export const downloadPDF = (doc, filename) => {
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`${filename}_${timestamp}.pdf`);
};
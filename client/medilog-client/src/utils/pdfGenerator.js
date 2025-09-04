// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateHealthRecordPDF = (userDetails, medicines = []) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Personal Health Record', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Helper function to add sections
  const addSection = (title, data, isTable = false) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(title, margin, yPosition);
    yPosition += 8;

    if (isTable && data.length > 0) {
      doc.autoTable({
        startY: yPosition,
        head: data[0],
        body: data.slice(1),
        margin: { left: margin, right: margin },
        styles: { fontSize: 9 },
        headStyles: { fillColor: [71, 85, 105] },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
      yPosition = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      
      if (Array.isArray(data)) {
        data.forEach(row => {
          if (Array.isArray(row)) {
            const colWidth = (pageWidth - 2 * margin) / row.length;
            row.forEach((cell, index) => {
              const xPos = margin + (index * colWidth);
              doc.text(String(cell || '—'), xPos, yPosition);
            });
            yPosition += 6;
          } else {
            doc.text(String(row || '—'), margin, yPosition);
            yPosition += 6;
          }
        });
      } else {
        doc.text(String(data || '—'), margin, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }
  };

  // Patient Information
  const patientInfo = [
    ['First name', 'Last name', 'Preferred name', 'Patient identifier'],
    [
      userDetails?.fullName?.split(' ')[0] || '',
      userDetails?.fullName?.split(' ').slice(1).join(' ') || '',
      userDetails?.preferredName || '',
      userDetails?._id?.slice(-8) || ''
    ],
    ['Gender', 'Date of birth', 'Blood type', 'Last updated date'],
    [
      userDetails?.gender || '',
      userDetails?.dateOfBirth ? new Date(userDetails.dateOfBirth).toLocaleDateString() : '',
      userDetails?.bloodGroup || '',
      userDetails?.updatedAt ? new Date(userDetails.updatedAt).toLocaleDateString() : ''
    ],
    ['Address', '', 'City', 'State', 'Zip code'],
    [
      userDetails?.address?.line1 || '',
      userDetails?.address?.line2 || '',
      userDetails?.address?.city || '',
      userDetails?.address?.state || '',
      userDetails?.address?.zip || ''
    ]
  ];
  addSection('Patient Information', patientInfo, true);

  // Emergency Contact
  if (userDetails?.emergencyContact?.name) {
    const emergencyContact = [
      ['Full name', 'Relationship', 'Contact number'],
      [
        userDetails.emergencyContact.name || '',
        userDetails.emergencyContact.relation || '',
        userDetails.emergencyContact.phone || ''
      ]
    ];
    addSection('Emergency Contact', emergencyContact, true);
  }

  // Insurance Information
  if (userDetails?.insuranceProvider) {
    const insuranceInfo = [
      ['Insurance carrier', 'Insurance plan', 'Contact number'],
      [userDetails.insuranceProvider || '', '', ''],
      ['Policy number', 'Group number', 'Social security number'],
      [userDetails.policyNumber || '', '', '']
    ];
    addSection('Insurance Information', insuranceInfo, true);
  }

  // Current Medications
  if (medicines.length > 0) {
    const medicationData = [
      ['Medicine Name', 'Dosage', 'Frequency', 'Times', 'Duration', 'Instructions']
    ];
    
    medicines.forEach(med => {
      const times = med.times ? med.times.join(', ') : '';
      const mealInstructions = [];
      if (med.beforeMeal) mealInstructions.push('Before meal');
      if (med.afterMeal) mealInstructions.push('After meal');
      if (med.withFood) mealInstructions.push('With food');
      
      medicationData.push([
        med.name || '',
        med.dosage || '',
        med.frequency ? med.frequency.replace('-', ' ') : '',
        times,
        med.duration || '',
        mealInstructions.join(', ') || med.instructions || ''
      ]);
    });
    
    addSection('Current Medications', medicationData, true);
  }

  // Known Medical Conditions
  if (userDetails?.chronicDiseases) {
    const conditions = typeof userDetails.chronicDiseases === 'string' 
      ? userDetails.chronicDiseases.split(',').map(c => c.trim()).filter(Boolean)
      : userDetails.chronicDiseases;
    
    if (conditions.length > 0) {
      addSection('Known Medical Conditions', conditions);
    }
  }

  // Allergies
  if (userDetails?.allergies) {
    const allergies = typeof userDetails.allergies === 'string'
      ? userDetails.allergies.split(',').map(a => a.trim()).filter(Boolean)
      : userDetails.allergies;
    
    if (allergies.length > 0) {
      addSection('Allergies', allergies);
    }
  }

  // Surgeries/Procedures
  if (userDetails?.surgeries) {
    let surgeries = userDetails.surgeries;
    if (typeof surgeries === 'string') {
      surgeries = surgeries.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    if (Array.isArray(surgeries) && surgeries.length > 0) {
      const surgeryData = [['Procedure', 'Date', 'Notes']];
      
      surgeries.forEach(surgery => {
        if (typeof surgery === 'object' && surgery !== null) {
          surgeryData.push([
            surgery.name || '',
            surgery.date ? new Date(surgery.date).toLocaleDateString() : '',
            surgery.notes || ''
          ]);
        } else {
          surgeryData.push([surgery, '', '']);
        }
      });
      
      addSection('Previous Surgeries/Procedures', surgeryData, true);
    }
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(
      `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );
    doc.text('MediTracker - Personal Health Management', pageWidth / 2, 292, { align: 'center' });
  }

  return doc;
};

export const downloadHealthRecordPDF = async (userDetails, medicines = []) => {
  try {
    const doc = generateHealthRecordPDF(userDetails, medicines);
    const fileName = `health-record-${userDetails?.fullName?.replace(/\s+/g, '-') || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
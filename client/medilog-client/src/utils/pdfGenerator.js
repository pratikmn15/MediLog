// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateHealthRecordPDF = (userDetails, medicines = []) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  let yPosition = 15;

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Personal Health Record', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Helper function to add sections with more compact spacing
  const addSection = (title, data, isTable = false) => {
    // Check if we need a new page - more lenient threshold
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 15;
    }

    if (title) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin, yPosition);
      yPosition += 6;
    }

    if (isTable && data.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [data[0]],
        body: data.slice(1),
        margin: { left: margin, right: margin },
        styles: { 
          fontSize: 8, 
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.5
        },
        headStyles: { 
          fillColor: [71, 85, 105], 
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        theme: 'grid'
      });
      yPosition = doc.lastAutoTable.finalY + 4; // Reduced spacing between tables
    } else {
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      
      if (Array.isArray(data)) {
        data.forEach(row => {
          if (Array.isArray(row)) {
            const colWidth = (pageWidth - 2 * margin) / row.length;
            row.forEach((cell, index) => {
              const xPos = margin + (index * colWidth);
              doc.text(String(cell || '—'), xPos, yPosition);
            });
            yPosition += 5;
          } else {
            doc.text(String(row || '—'), margin, yPosition);
            yPosition += 5;
          }
        });
      } else {
        doc.text(String(data || '—'), margin, yPosition);
        yPosition += 5;
      }
      yPosition += 3;
    }
  };

  // FIXED: Patient Information with proper table structure
  const patientInfo1 = [
    ['First name', 'Last name', 'Preferred name', 'Patient identifier'],
    [
      userDetails?.fullName?.split(' ')[0] || '',
      userDetails?.fullName?.split(' ').slice(1).join(' ') || '',
      userDetails?.preferredName || '',
      userDetails?._id?.slice(-8) || ''
    ]
  ];

  const patientInfo2 = [
    ['Gender', 'Date of birth', 'Blood type', 'Last updated date'],
    [
      userDetails?.gender || '',
      userDetails?.dateOfBirth ? new Date(userDetails.dateOfBirth).toLocaleDateString() : '',
      userDetails?.bloodGroup || '',
      userDetails?.updatedAt ? new Date(userDetails.updatedAt).toLocaleDateString() : ''
    ]
  ];

  const addressInfo = [
    ['Address', 'City', 'State', 'Zip code'],
    [
      userDetails?.address?.line1 || '',
      userDetails?.address?.city || '',
      userDetails?.address?.state || '',
      userDetails?.address?.zip || ''
    ]
  ];

  addSection('Patient Information', patientInfo1, true);
  addSection('', patientInfo2, true); // No title for continuation
  addSection('', addressInfo, true); // No title for continuation

  // Emergency Contact - compact single row
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

  // Insurance Information - compact
  if (userDetails?.insuranceProvider) {
    const insuranceInfo = [
      ['Insurance carrier', 'Insurance plan', 'Contact number'],
      [
        userDetails.insuranceProvider || '',
        '',
        ''
      ]
    ];

    const policyInfo = [
      ['Policy number', 'Group number', 'Social security number'],
      [
        userDetails.policyNumber || '',
        userDetails.groupNumber || '',
        ''
      ]
    ];

    addSection('Insurance Information', insuranceInfo, true);
    addSection('', policyInfo, true);
  }

  // Current Medications - more compact with combined instructions
  if (medicines.length > 0) {
    const medicationData = [
      ['Medicine Name', 'Dosage', 'Frequency', 'Times', 'Instructions']
    ];
    
    medicines.forEach(med => {
      const times = med.times ? med.times.join(', ') : '';
      const frequency = med.frequency ? med.frequency.replace('-', ' ') : '';
      
      // Combine meal instructions and notes
      const instructions = [];
      if (med.beforeMeal) instructions.push('Before meal');
      if (med.afterMeal) instructions.push('After meal');
      if (med.withFood) instructions.push('With food');
      if (med.instructions) instructions.push(med.instructions);
      
      medicationData.push([
        med.name || '',
        med.dosage || '',
        frequency,
        times,
        instructions.join('; ') || ''
      ]);
    });
    
    addSection('Current Medications', medicationData, true);
  }

  // Health Information section - combine multiple health fields
  const healthInfo = [];
  const healthHeaders = ['Category', 'Details'];
  healthInfo.push(healthHeaders);

  if (userDetails?.chronicDiseases) {
    const conditions = typeof userDetails.chronicDiseases === 'string' 
      ? userDetails.chronicDiseases 
      : Array.isArray(userDetails.chronicDiseases) 
        ? userDetails.chronicDiseases.join(', ')
        : '';
    if (conditions) {
      healthInfo.push(['Known Medical Conditions', conditions]);
    }
  }

  if (userDetails?.allergies) {
    const allergies = typeof userDetails.allergies === 'string'
      ? userDetails.allergies
      : Array.isArray(userDetails.allergies)
        ? userDetails.allergies.join(', ')
        : '';
    if (allergies) {
      healthInfo.push(['Allergies', allergies]);
    }
  }

  if (userDetails?.surgeries) {
    let surgeries = userDetails.surgeries;
    if (typeof surgeries === 'string') {
      healthInfo.push(['Previous Surgeries', surgeries]);
    } else if (Array.isArray(surgeries) && surgeries.length > 0) {
      const surgeryText = surgeries.map(s => 
        typeof s === 'object' ? `${s.name || 'Surgery'} (${s.date ? new Date(s.date).toLocaleDateString() : 'Date unknown'})` : s
      ).join('; ');
      healthInfo.push(['Previous Surgeries', surgeryText]);
    }
  }

  // Only add health information section if there's data
  if (healthInfo.length > 1) {
    addSection('Health Information', healthInfo, true);
  }

  // Physician Information section (empty table for manual filling)
  const physicianInfo = [
    ['Name', 'Designation/Specialty', 'Phone', 'Address', 'Notes'],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
  ];
  addSection('Physician Information', physicianInfo, true);

  // Footer with compact spacing
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} | MediTracker | Page ${i}/${pageCount}`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );
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
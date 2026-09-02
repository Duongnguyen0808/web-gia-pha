export function getHueKinshipTerm(
  me: any,
  target: any,
  treeData: any[]
): string {
  const genDiff = me.generation - target.generation;
  
  // Xác định người gốc máu (nếu đang xét dâu/rể thì lấy người phối ngẫu làm gốc)
  let myBloodNode = me;
  let isMeInLaw = false;
  if (me.spouseOf) {
    const spouse = treeData.find(p => p.id === me.spouseOf);
    if (spouse) {
      myBloodNode = spouse;
      isMeInLaw = true;
    }
  }

  let targetBloodNode = target;
  let isTargetInLaw = false;
  if (target.spouseOf) {
    const spouse = treeData.find(p => p.id === target.spouseOf);
    if (spouse) {
      targetBloodNode = spouse;
      isTargetInLaw = true;
    }
  }

  // CÙNG THẾ HỆ (genDiff === 0)
  if (genDiff === 0) {
    if (me.spouseOf === target.id) return target.gender === 'male' ? 'Chồng' : 'Vợ';
    if (me.id === target.id) return 'Bản thân';
    
    // So sánh tuổi của người gốc máu
    let myYear = myBloodNode.birthYear || 0;
    let targetYear = targetBloodNode.birthYear || 0;
    
    if (myYear === 0 || targetYear === 0) {
      return target.gender === 'male' ? 'Anh/Em' : 'Chị/Em';
    }

    if (myYear > targetYear) {
      // Mình sinh sau (hoặc vợ/chồng mình sinh sau) -> Nhỏ hơn -> Gọi bằng Anh/Chị
      return target.gender === 'male' ? 'Anh' : 'Chị';
    } else {
      return target.gender === 'male' ? 'Em' : 'Em';
    }
  }

  // BỀ TRÊN 1 THẾ HỆ (genDiff === 1) -> Cha mẹ, Chú bác, Cô dì
  if (genDiff === 1) {
    // Nếu target chính là cha mẹ ruột hoặc cha mẹ vợ/chồng
    if (myBloodNode.parentId === targetBloodNode.id) {
      if (isMeInLaw) {
        // Mình là dâu/rể gọi cha mẹ vợ/chồng
        return target.gender === 'male' ? 'Ba (Ôn)' : 'Mạ (Mệ)';
      } else {
        // Gọi cha mẹ ruột
        return target.gender === 'male' ? 'Ba' : 'Mạ';
      }
    }

    // Nếu không phải cha mẹ, thì là họ hàng (anh chị em của cha/mẹ)
    const myParent = treeData.find(p => p.id === myBloodNode.parentId);
    if (myParent && myParent.birthYear && targetBloodNode.birthYear) {
      const isPaternal = myParent.gender === 'male'; // Bên nội (Cha)
      const isMaternal = myParent.gender === 'female'; // Bên ngoại (Mẹ)
      const isOlder = targetBloodNode.birthYear < myParent.birthYear; // Lớn tuổi hơn cha/mẹ

      if (isPaternal) {
        // Bên Nội
        if (targetBloodNode.gender === 'male') {
          if (isOlder) {
            return isTargetInLaw ? 'Bác gái' : 'Bác';
          } else {
            return isTargetInLaw ? 'Thím' : 'Chú';
          }
        } else {
          // Chị hoặc em gái của ba đều là O
          return isTargetInLaw ? 'Dượng' : 'O';
        }
      } else if (isMaternal) {
        // Bên Ngoại
        if (targetBloodNode.gender === 'male') {
          return isTargetInLaw ? 'Mợ' : 'Cậu'; // Anh/em trai của mạ là Cậu
        } else {
          // Chị/em gái của mạ
          if (isOlder) {
            return isTargetInLaw ? 'Dượng' : 'Dì (Bác)';
          } else {
            return isTargetInLaw ? 'Dượng' : 'Dì';
          }
        }
      }
    }
    
    return target.gender === 'male' ? 'Chú/Bác/Cậu' : 'O/Dì/Bác gái';
  }

  // BỀ TRÊN 2 THẾ HỆ (genDiff === 2) -> Ông Bà
  if (genDiff === 2) {
    return target.gender === 'male' ? 'Ôn' : 'Mệ';
  }

  // BỀ TRÊN 3 THẾ HỆ (genDiff === 3) -> Cố
  if (genDiff === 3) {
    return 'Cố';
  }

  if (genDiff > 3) {
    return 'Tổ Tiên (Cố/Ngài)';
  }

  // BỀ DƯỚI 1 THẾ HỆ (genDiff === -1) -> Con, Cháu
  if (genDiff === -1) {
    // Nếu targetBlood là con trực tiếp của myBlood
    if (targetBloodNode.parentId === myBloodNode.id) {
      if (isTargetInLaw) {
        return target.gender === 'male' ? 'Con rể' : 'Con dâu';
      } else {
        return target.gender === 'male' ? 'Con trai' : 'Con gái';
      }
    }
    return 'Cháu';
  }

  // BỀ DƯỚI 2 THẾ HỆ (genDiff === -2) -> Cháu
  if (genDiff === -2) {
    return 'Cháu';
  }

  // BỀ DƯỚI 3 THẾ HỆ (genDiff === -3) -> Chắt
  if (genDiff === -3) {
    return 'Chắt';
  }
  
  // BỀ DƯỚI 4 THẾ HỆ (genDiff === -4) -> Chút
  if (genDiff === -4) {
    return 'Chút';
  }

  if (genDiff < -4) {
    return 'Chút/Chít';
  }

  return 'Họ hàng';
}

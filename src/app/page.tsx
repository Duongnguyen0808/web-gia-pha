'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import treeData from '../data/family-tree.json';
import { getHueKinshipTerm } from '../utils/kinship';

const Tree = dynamic(
  () => import('react-organizational-chart').then(mod => ({ default: mod.Tree })),
  { ssr: false }
);
const TreeNode = dynamic(
  () => import('react-organizational-chart').then(mod => ({ default: mod.TreeNode })),
  { ssr: false }
);

export default function Home() {
  const [selectedMe, setSelectedMe] = useState<number | null>(null);
  const [activePerson, setActivePerson] = useState<any | null>(null);
  const [avatars, setAvatars] = useState<Record<number, string>>({});
  const [treeScale, setTreeScale] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const treeScrollAreaRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Load avatars from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedAvatars: Record<number, string> = {};
    treeData.forEach(p => {
      const stored = localStorage.getItem(`avatar_${p.id}`);
      if (stored) {
        savedAvatars[p.id] = stored;
      }
    });
    setAvatars(savedAvatars);
  }, []);

  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth < 1024) {
        setTreeScale(1);
        return;
      }
      if (treeContainerRef.current && treeScrollAreaRef.current) {
        treeScrollAreaRef.current.style.transform = 'scale(1)';
        const treeWidth = treeScrollAreaRef.current.scrollWidth;
        const containerWidth = treeContainerRef.current.clientWidth;

        if (treeWidth > containerWidth) {
          const scale = (containerWidth - 20) / treeWidth;
          setTreeScale(scale);
        } else {
          setTreeScale(1);
        }
      }
    };

    setTimeout(updateScale, 100);
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Build Hierarchical Tree
  const buildTree = (nodes: any[], parentId: number | null = null): any[] => {
    return nodes
      .filter(node => node.parentId === parentId && !node.spouseOf)
      .map(node => {
        const spouses = nodes.filter(n => n.spouseOf === node.id);
        return {
          ...node,
          spouses,
          children: buildTree(nodes, node.id)
        };
      });
  };

  const rootNodes = buildTree(treeData, null);

  const handlePersonClick = (person: any) => {
    setActivePerson(person);
  };

  const closeModal = () => {
    setActivePerson(null);
  };

  const getCallTerm = (targetPerson: any) => {
    if (!selectedMe) return null;
    if (selectedMe === targetPerson.id) return 'Bản thân (Tui)';
    
    const me = treeData.find(p => p.id === selectedMe);
    if (!me) return null;

    return getHueKinshipTerm(me, targetPerson, treeData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activePerson) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        setAvatars(prev => ({
          ...prev,
          [activePerson.id]: base64String
        }));
        
        try {
          localStorage.setItem(`avatar_${activePerson.id}`, base64String);
        } catch (err) {
          alert('Không thể lưu ảnh do dung lượng quá lớn, vui lòng chọn ảnh nhẹ hơn.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (activePerson) {
      setAvatars(prev => {
        const newAvatars = { ...prev };
        delete newAvatars[activePerson.id];
        return newAvatars;
      });
      localStorage.removeItem(`avatar_${activePerson.id}`);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getAvatarSource = (id: number, gender: string) => {
    if (avatars[id]) return avatars[id];
    if (gender === 'male') {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23c39953"><path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3zm9 11v-1c0-3.859-3.141-7-7-7H10c-3.859 0-7 3.141-7 7v1h2v-1c0-2.757 2.243-5 5-5h4c2.757 0 5 2.243 5 5v1h2z"/></svg>';
    }
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%238b2520"><path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3zm9 11v-1c0-3.859-3.141-7-7-7H10c-3.859 0-7 3.141-7 7v1h2v-1c0-2.757 2.243-5 5-5h4c2.757 0 5 2.243 5 5v1h2z"/></svg>';
  };

  const getLunarYearName = (year: number) => {
    const CANH = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
    const CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
    return `${CANH[year % 10]} ${CHI[year % 12]}`;
  };

  const renderPersonCard = (person: any, isSelected: boolean) => {
    let displayName = person.name;
    // Bỏ chữ (Dâu/Rể) đối với người đời thứ 1 (Cụ Tổ / Root)
    if (person.spouseOf && person.generation > 1) {
      const inLawRole = person.gender === 'male' ? 'Rể' : 'Dâu';
      displayName += ` (${inLawRole})`;
    }

    const callTerm = selectedMe && selectedMe !== person.id ? getCallTerm(person) : null;
    const isMe = selectedMe === person.id;

    return (
      <div 
        key={person.id} 
        className={`person-card ${isSelected ? 'selected' : ''} ${person.deathYear ? 'deceased' : ''}`}
        onClick={() => handlePersonClick(person)}
      >
        <img src={getAvatarSource(person.id, person.gender)} alt={person.name} className="person-avatar" />
        <h3 className="person-name">{displayName}</h3>
        <p className="person-years" style={{ marginBottom: person.birthYear ? '2px' : '5px' }}>
          {person.birthYear ? person.birthYear : '...'} - {person.deathYear ? person.deathYear : 'Nay'}
        </p>
        {person.birthYear && (
          <p className="person-lunar">
            ({getLunarYearName(person.birthYear)})
          </p>
        )}
        
        {/* Hiển thị xưng hô trực tiếp trong thẻ nếu đã chọn */}
        {callTerm && (
          <div className="card-call-term">
            Gọi là: <strong>{callTerm}</strong>
          </div>
        )}
        {isMe && (
          <div className="card-call-term" style={{ background: 'var(--color-purple)'}}>
            <strong>Đây là bạn</strong>
          </div>
        )}
      </div>
    );
  };

  const getFamilyTitle = (node: any) => {
    if (node.familyTitle) return node.familyTitle;
    if (!node.parentId) return "Gốc Gia Phả";
    
    // Tính con thứ mấy
    const siblings = treeData
      .filter(p => p.parentId === node.parentId)
      .sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));
    
    const order = siblings.findIndex(p => p.id === node.id) + 1;
    return `Con thứ ${order}`;
  };

  // Recursive rendering function for organizational chart
  const TreeNodeRender = ({ node }: { node: any }) => {
    const nodeLabel = (
      <div className="family-unit-wrapper">
        <div className="family-unit-title">{getFamilyTitle(node)}</div>
        <div className="family-unit">
          {renderPersonCard(node, selectedMe === node.id)}
          {node.spouses && node.spouses.map((spouse: any) => (
             <React.Fragment key={spouse.id}>
               <span className="spouse-connector">♥</span>
               {renderPersonCard(spouse, selectedMe === spouse.id)}
             </React.Fragment>
          ))}
        </div>
      </div>
    );

    if (!node.children || node.children.length === 0) {
      return <TreeNode label={nodeLabel} />;
    }

    return (
      <TreeNode label={nodeLabel}>
        {node.children.map((child: any) => (
          <TreeNodeRender key={child.id} node={child} />
        ))}
      </TreeNode>
    );
  };

  if (!isMounted) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-gold)', fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>Đang tải Gia phả...</p>
      </main>
    );
  }

  return (
    <main>
      <div className="header-glass fade-in">
        <h1 className="title">Gia Phả Dòng Họ Đặng</h1>
        <p className="subtitle" style={{ animationDelay: '0.2s' }}>
          Ông Đặng Văn Sừng & Bà Võ Thị Chanh
        </p>

        <div style={{ textAlign: 'center', marginBottom: '20px' }} className="fade-in">
          {selectedMe ? (
            <div style={{ background: 'rgba(255,255,255,0.8)', padding: '10px 20px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '15px', border: '2px solid var(--color-purple)' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                Đang xem với vai trò: <span style={{ color: 'var(--color-red)' }}>{treeData.find(p => p.id === selectedMe)?.name}</span>
              </span>
              <button 
                onClick={() => setSelectedMe(null)}
                style={{ background: '#ddd', border: 'none', padding: '5px 15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Hủy / Đổi người
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(195, 153, 83, 0.2)', padding: '10px 20px', borderRadius: '12px', display: 'inline-block', border: '1px dashed var(--color-gold)', color: 'var(--color-red)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              💡 Mẹo: Bấm vào tên bạn trên sơ đồ và chọn "ĐÂY LÀ TÔI" để tự động tính cách xưng hô với toàn dòng họ!
            </div>
          )}
        </div>
      </div>

      <div className="tree-container fade-in" style={{ animationDelay: '0.4s' }} ref={treeContainerRef}>
        <div 
          className="tree-scroll-area" 
          ref={treeScrollAreaRef}
          style={treeScale !== 1 ? { transform: `scale(${treeScale})`, transformOrigin: 'top center', transition: 'transform 0.3s ease' } : {}}
        >
          {rootNodes.map(rootNode => {
            const rootLabel = (
              <div className="family-unit-wrapper">
                <div className="family-unit-title" style={{ background: 'var(--color-gold)', color: 'var(--color-purple)'}}>Ông Bà Tổ</div>
                <div className="family-unit">
                  {renderPersonCard(rootNode, selectedMe === rootNode.id)}
                  {rootNode.spouses && rootNode.spouses.map((spouse: any) => (
                    <React.Fragment key={spouse.id}>
                      <span className="spouse-connector">♥</span>
                      {renderPersonCard(spouse, selectedMe === spouse.id)}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );

            return (
              <Tree
                key={rootNode.id}
                lineWidth={'2px'}
                lineColor={'var(--color-gold)'}
                lineBorderRadius={'12px'}
                lineHeight={'30px'}
                nodePadding={'10px'}
                label={rootLabel}
              >
                {rootNode.children && rootNode.children.map((child: any) => (
                  <TreeNodeRender key={child.id} node={child} />
                ))}
              </Tree>
            );
          })}
        </div>
      </div>

      {/* Modal Profile */}
      {activePerson && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>×</button>
            
            <div className="modal-avatar-container">
              <img 
                src={getAvatarSource(activePerson.id, activePerson.gender)} 
                alt={activePerson.name} 
                className="modal-avatar" 
              />
              <button className="upload-btn" onClick={triggerFileInput} title="Tải ảnh lên">
                📷
              </button>
              {avatars[activePerson.id] && (
                <button className="delete-btn" onClick={handleRemoveImage} title="Xóa ảnh">
                  ❌
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="file-input" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <h2 className="modal-name">{activePerson.name}</h2>
            <p className="modal-role">Đời thứ {activePerson.generation}</p>
            <div className="modal-desc">
              <p><strong>Năm sinh:</strong> {activePerson.birthYear || 'Chưa rõ'}</p>
              <p><strong>Thông tin:</strong> {activePerson.description}</p>
            </div>
            
            {/* Hiển thị xưng hô bên trong modal cho rõ ràng hơn nếu đã chọn ở ngoài */}
            {selectedMe && selectedMe !== activePerson.id && (
              <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(195, 153, 83, 0.1)', borderRadius: '8px', border: '1px dashed var(--color-gold)' }}>
                <p>Bạn gọi người này là:</p>
                <div className="call-term" style={{ fontSize: '1.3rem', padding: '10px 20px' }}>
                  {getCallTerm(activePerson)}
                </div>
              </div>
            )}

            {/* Nút Đặt đây là tôi */}
            {selectedMe !== activePerson.id && (
              <button 
                onClick={() => {
                  setSelectedMe(activePerson.id);
                  closeModal();
                }}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  padding: '12px',
                  background: 'var(--color-purple)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(74, 44, 90, 0.3)'
                }}
              >
                🙋‍♂️ ĐẶT ĐÂY LÀ TÔI
              </button>
            )}
            {selectedMe === activePerson.id && (
              <div style={{ marginTop: '20px', padding: '12px', background: '#ddd', borderRadius: '8px', fontWeight: 'bold' }}>
                ✅ Đang đóng vai người này
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

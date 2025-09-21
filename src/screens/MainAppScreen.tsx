import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ScrollView, Alert, Modal, Platform, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Searchbar } from 'react-native-paper';
import { db } from '../../config/firebaseConfig'; // Import db
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc // Import updateDoc
} from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { Member, Transaction } from '../types';
import { styles } from '../styles/AppStyles'; // Import styles

const MainAppScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [memberModalVisible, setMemberModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'memberDetails'>('dashboard');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id' | 'userId'>>({
    memberId: '',
    amount: 0,
    description: '',
    date: new Date(),
  });
  
  const [newMember, setNewMember] = useState<Omit<Member, 'id' | 'userId' | 'totalCollected' | 'dueAmount' | 'lastPayment'>>({
    name: '',
    phone: '',
    initialAmount: 0,
    interestRate: 0,
    joinDate: new Date(),
  });

  const { user, signOut } = useAuth();

  // Firestore collections
  const membersCollectionRef = collection(db, 'members');
  const transactionsCollectionRef = collection(db, 'transactions');

  useEffect(() => {
    if (user?.uid) {
      // Fetch members
      const qMembers = query(membersCollectionRef, where('userId', '==', user.uid));
      const unsubscribeMembers = onSnapshot(qMembers, (snapshot) => {
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          joinDate: (doc.data().joinDate?.toDate() || new Date()),
          lastPayment: (doc.data().lastPayment?.toDate() || null),
        })) as Member[];
        setMembers(membersData);
      });

      // Fetch transactions
      const qTransactions = query(transactionsCollectionRef, where('userId', '==', user.uid));
      const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
        const transactionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: (doc.data().date?.toDate() || new Date()),
        })) as Transaction[];
        setTransactions(transactionsData);
      });

      return () => { 
        unsubscribeMembers(); 
        unsubscribeTransactions();
      };
    } else {
      setMembers([]);
      setTransactions([]);
    }
  }, [user?.uid]);

  const calculateDueAmount = (member: Member) => {
    const totalWithInterest = member.initialAmount * (1 + member.interestRate / 100);
    return totalWithInterest - member.totalCollected;
  };

  const addTransaction = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    if (!newTransaction.memberId || newTransaction.amount <= 0 || !newTransaction.description) {
      Alert.alert('Error', 'Please fill all fields with valid data.');
      return;
    }

    const amount = newTransaction.amount;
    const member = members.find(m => m.id === newTransaction.memberId);

    if (!member) {
      Alert.alert('Error', 'Selected member not found.');
      return;
    }

    if (amount > member.dueAmount) {
      Alert.alert('Error', 'Payment amount exceeds due amount');
      return;
    }

    const transactionToSave = {
      memberId: newTransaction.memberId,
      amount: amount,
      description: newTransaction.description,
      date: date,
      userId: user.uid,
    };

    try {
      const docRef = await addDoc(transactionsCollectionRef, transactionToSave);
      
      const newTotalCollected = member.totalCollected + amount;
      const newDueAmount = calculateDueAmount({...member, totalCollected: newTotalCollected});

      await updateDoc(doc(db, 'members', member.id), {
        totalCollected: newTotalCollected,
        dueAmount: newDueAmount,
        lastPayment: date,
      });

      setNewTransaction({
        memberId: '',
        amount: 0,
        description: '',
        date: new Date(),
      });
      setDate(new Date());
      setModalVisible(false);
      Alert.alert('Success', 'Transaction added successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const addMember = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    if (!newMember.name || !newMember.phone || newMember.initialAmount <= 0 || newMember.interestRate <= 0) {
      Alert.alert('Error', 'Please fill all fields with valid data.');
      return;
    }

    const initialAmount = newMember.initialAmount;
    const interestRate = newMember.interestRate;
    const dueAmount = initialAmount * (1 + interestRate / 100);

    const memberToSave = {
      name: newMember.name,
      phone: newMember.phone,
      initialAmount: initialAmount,
      interestRate: interestRate,
      joinDate: date,
      totalCollected: 0,
      dueAmount: dueAmount,
      lastPayment: null,
      userId: user.uid,
    };

    try {
      await addDoc(membersCollectionRef, memberToSave);
      setNewMember({
        name: '',
        phone: '',
        initialAmount: 0,
        interestRate: 0,
        joinDate: new Date(),
      });
      setDate(new Date());
      setMemberModalVisible(false);
      Alert.alert('Success', 'Member added successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const deleteMember = async () => {
    if (!memberToDelete) return;
    
    const memberTransactions = transactions.filter(t => t.memberId === memberToDelete.id);
    if (memberTransactions.length > 0) {
      Alert.alert('Error', 'Cannot delete member with existing transactions');
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'members', memberToDelete.id));
      setDeleteModalVisible(false);
      setMemberToDelete(null);
      Alert.alert('Success', 'Member deleted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const confirmDelete = (member: Member) => {
    setMemberToDelete(member);
    setDeleteModalVisible(true);
  };

  const getMemberName = (id: string) => {
    const member = members.find(m => m.id === id);
    return member ? member.name : 'Unknown';
  };

  const getMemberDetails = (id: string) => {
    return members.find(m => m.id === id);
  };

  const getTotalAmount = () => {
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getTodayTotal = () => {
    const today = new Date();
    return transactions
      .filter(transaction => 
        transaction.date.getDate() === today.getDate() &&
        transaction.date.getMonth() === today.getMonth() &&
        transaction.date.getFullYear() === today.getFullYear()
      )
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getWeekTotal = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return transactions
      .filter(transaction => transaction.date.getTime() >= oneWeekAgo.getTime())
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getMonthTotal = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return transactions
      .filter(transaction => transaction.date.getTime() >= oneMonthAgo.getTime())
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const onChangeDate = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.includes(searchQuery)
  );

  const filteredTransactions = transactions.filter(transaction => 
    getMemberName(transaction.memberId).toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMemberTransactions = (memberId: string) => {
    return transactions.filter(transaction => transaction.memberId === memberId);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.memberName}>{getMemberName(item.memberId)}</Text>
        <Text style={styles.transactionDesc}>{item.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.transactionAmount}>{formatCurrency(item.amount)}</Text>
    </View>
  );

  const renderMember = ({ item }: { item: Member }) => (
    <TouchableOpacity 
      style={styles.memberItem}
      onPress={() => {
        setSelectedMember(item);
        setActiveTab('memberDetails');
      }}
    >
      <View style={styles.memberAvatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberPhone}>{item.phone}</Text>
        <Text style={styles.memberJoinDate}>Joined: {formatDate(item.joinDate)}</Text>
      </View>
      <View style={styles.memberStats}>
        <Text style={styles.memberDue}>{formatCurrency(item.dueAmount)}</Text>
        <Text style={styles.lastPayment}>
          {item.lastPayment ? `Last: ${formatDate(item.lastPayment)}` : 'No payments yet'}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => confirmDelete(item)}
      >
        <Ionicons name="trash" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderMemberDetails = () => {
    if (!selectedMember) return null;
    
    const memberTransactions = getMemberTransactions(selectedMember.id);
    // Calculate totals and averages based on fetched transactions
    const totalCollectedForMember = memberTransactions.reduce((sum, t) => sum + t.amount, 0);

    const interestAmount = selectedMember.initialAmount * (selectedMember.interestRate / 100);
    
    return (
      <View style={styles.memberDetailContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setActiveTab('members')}
        >
          <Ionicons name="arrow-back" size={24} color="#2f95dc" />
          <Text style={styles.backText}>Back to Members</Text>
        </TouchableOpacity>
        
        <View style={styles.memberHeader}>
          <View style={[styles.memberAvatar, styles.largeAvatar]}>
            <Text style={styles.largeAvatarText}>{selectedMember.name.charAt(0)}</Text>
          </View>
          <View style={styles.memberHeaderInfo}>
            <Text style={styles.memberDetailName}>{selectedMember.name}</Text>
            <Text style={styles.memberDetailPhone}>{selectedMember.phone}</Text>
            <Text style={styles.memberDetailJoinDate}>
              Member since: {formatDate(selectedMember.joinDate)}
            </Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(selectedMember.initialAmount)}</Text>
            <Text style={styles.statLabel}>Initial Amount</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{selectedMember.interestRate}%</Text>
            <Text style={styles.statLabel}>Interest Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(interestAmount)}</Text>
            <Text style={styles.statLabel}>Interest Amount</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(selectedMember.totalCollected)}</Text>
            <Text style={styles.statLabel}>Total Collected</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(selectedMember.dueAmount)}</Text>
            <Text style={styles.statLabel}>Due Amount</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{memberTransactions.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {memberTransactions.length > 0 ? (
          <FlatList
            data={memberTransactions}
            renderItem={renderTransaction}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>No transactions recorded for this member.</Text>
        )}
      </View>
    );
  };

  const renderDashboard = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Collection</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(getTodayTotal())}</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.smallCard]}>
          <Text style={styles.summaryLabel}>Weekly Total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(getWeekTotal())}</Text>
        </View>
        <View style={[styles.summaryCard, styles.smallCard]}>
          <Text style={styles.summaryLabel}>Monthly Total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(getMonthTotal())}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.smallCard]}>
          <Text style={styles.summaryLabel}>Total Collected</Text>
          <Text style={styles.summaryValue}>{formatCurrency(transactions.reduce((total, transaction) => total + transaction.amount, 0))}</Text>
        </View>
        <View style={[styles.summaryCard, styles.smallCard]}>
          <Text style={styles.summaryLabel}>Members</Text>
          <Text style={styles.summaryValue}>{members.length}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={24} color="#2f95dc" />
        </TouchableOpacity>
      </View>
      
      {transactions.slice(0, 5).length > 0 ? (
        <FlatList
          data={transactions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)}
          renderItem={renderTransaction}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.emptyText}>No transactions yet. Add your first transaction!</Text>
      )}
    </ScrollView>
  );

  const renderMembers = () => (
    <View style={styles.tabContent}>
      <Searchbar
        placeholder="Search members"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {filteredMembers.length > 0 ? (
        <FlatList
          data={filteredMembers.sort((a, b) => a.name.localeCompare(b.name))}
          renderItem={renderMember}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.emptyText}>No members found.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cash Collection Tracker - {user?.displayName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setMemberModalVisible(true)} style={styles.headerButton}>
            <Ionicons name="person-add" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => signOut()} style={styles.headerButton}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {activeTab === 'dashboard' && (
        <Searchbar
          placeholder="Search transactions or members"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      )}

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons 
            name="home" 
            size={20} 
            color={activeTab === 'dashboard' ? '#2f95dc' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'members' && styles.activeTab]}
          onPress={() => setActiveTab('members')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'members' ? '#2f95dc' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
            Members
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'members' && renderMembers()}
      {activeTab === 'memberDetails' && renderMemberDetails()}

      {/* Add Transaction Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Transaction</Text>
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                Date: {formatDate(date)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Amount (LKR)"
              keyboardType="numeric"
              value={newTransaction.amount.toString()}
              onChangeText={text => setNewTransaction({...newTransaction, amount: parseFloat(text) || 0})}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newTransaction.description}
              onChangeText={text => setNewTransaction({...newTransaction, description: text})}
            />

            <Text style={styles.inputLabel}>Select Member</Text>
            <ScrollView style={styles.memberPicker}>
              {members.map(member => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberOption,
                    newTransaction.memberId === member.id && styles.selectedMember
                  ]}
                  onPress={() => setNewTransaction({...newTransaction, memberId: member.id})}
                >
                  <View>
                    <Text style={styles.memberOptionName}>{member.name}</Text>
                    <Text style={styles.memberOptionDue}>Due: {formatCurrency(member.dueAmount)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={addTransaction}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={memberModalVisible}
        onRequestClose={() => setMemberModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Member</Text>
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                Join Date: {formatDate(date)}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newMember.name}
              onChangeText={text => setNewMember({...newMember, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={newMember.phone}
              onChangeText={text => setNewMember({...newMember, phone: text})}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Initial Amount (LKR)"
              keyboardType="numeric"
              value={newMember.initialAmount.toString()}
              onChangeText={text => setNewMember({...newMember, initialAmount: parseFloat(text) || 0})}
            />

            <TextInput
              style={styles.input}
              placeholder="Interest Rate (%)"
              keyboardType="numeric"
              value={newMember.interestRate.toString()}
              onChangeText={text => setNewMember({...newMember, interestRate: parseFloat(text) || 0})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setMemberModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={addMember}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Member</Text>
            
            <Text style={styles.deleteText}>
              Are you sure you want to delete {memberToDelete?.name}? This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.deleteConfirmButton]}
                onPress={deleteMember}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MainAppScreen;
